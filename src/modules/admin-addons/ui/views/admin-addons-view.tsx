"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { DataPagination } from "@/components/DataPagination";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";

import { useAddonsAdminFilters } from "../../hooks/use-admin-users";
import { AddonRow, columnsFactory } from "../components/columns";
import { ConfirmToggleAddonDialog } from "../components/confirm-toggle-addon-dialog";
import {
  EditAddonPromptsDialog,
  PromptsFormValues,
} from "../components/edit-addon-prompts-dialog";
import {
  EditAddonMetaDialog,
  MetaFormValues,
} from "../components/edit-addon-meta-dialog";

const AdminAddonsView = () => {
  const [filters, setFilters] = useAddonsAdminFilters();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [selectedAddon, setSelectedAddon] = useState<AddonRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editMetaOpen, setEditMetaOpen] = useState(false);
  const [editPromptsOpen, setEditPromptsOpen] = useState(false);

  // main data query
  const { data } = useSuspenseQuery(
    trpc.adminAddons.getMany.queryOptions({ ...filters }),
  );

  // mutations
  const toggleMutation = useMutation(
    trpc.adminAddons.toggleEnabled.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.adminAddons.getMany.queryOptions({}),
        );
         await queryClient.invalidateQueries(
          trpc.addonsRouter.getMany.queryOptions(),
        );
        toast.success("Addon status updated");
      },
      onError: () => {
        toast.error("Failed to update addon status");
      },
    }),
  );

  const updatePromptsMutation = useMutation(
    trpc.adminAddons.updatePrompts.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.adminAddons.getMany.queryOptions({}),
        );
         await queryClient.invalidateQueries(
          trpc.addonsRouter.getMany.queryOptions(),
        );
        toast.success("Addon prompts updated");
      },
      onError: () => {
        toast.error("Failed to update addon prompts");
      },
    }),
  );

  const updateMetaMutation = useMutation(
    trpc.adminAddons.updateMeta.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.adminAddons.getMany.queryOptions({}),
        );
        await queryClient.invalidateQueries(
          trpc.addonsRouter.getMany.queryOptions(),
        );
        toast.success("Addon details updated");
      },
      onError: () => {
        toast.error("Failed to update addon details");
      },
    }),
  );

  // handlers
  const handleSavePrompts = async (values: PromptsFormValues) => {
    if (!selectedAddon) return;

    await updatePromptsMutation.mutateAsync({
      id: selectedAddon.id,
      systemPrompt: values.systemPrompt ?? null,
      customPrompt: values.customPrompt ?? null,
    });

    setEditPromptsOpen(false);
  };

  const handleSaveMeta = async (values: MetaFormValues) => {
    if (!selectedAddon) return;

    try {
      await updateMetaMutation.mutateAsync({
        id: selectedAddon.id,
        name: values.name.trim(),
        description: values.description?.trim() || null,
        isPremium: values.isPremium,
        iconId: values.iconId || null,
      });

      setEditMetaOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update addon meta");
    }
  };

  const columns = useMemo(
    () =>
      columnsFactory({
        onToggleConfirm: (addon) => {
          setSelectedAddon(addon);
          setConfirmOpen(true);
        },
        onEditMeta: (addon) => {
          setSelectedAddon(addon);
          setEditMetaOpen(true);
        },
        onEditPrompts: (addon) => {
          setSelectedAddon(addon);
          setEditPromptsOpen(true);
        },
      }),
    [],
  );

  return (
    <>
      <div className="flex flex-1 flex-grow flex-col gap-y-4 pb-4">
        <DataTable data={data.items} columns={columns} />
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>

      {/* Enable / disable confirm dialog */}
      <ConfirmToggleAddonDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        addon={selectedAddon}
        loading={toggleMutation.isPending}
        onConfirm={async () => {
          if (!selectedAddon) return;
          await toggleMutation.mutateAsync({
            id: selectedAddon.id,
            isEnabled: !selectedAddon.isEnabled,
          });
          setConfirmOpen(false);
        }}
      />

      {/* Edit prompts dialog */}
      <EditAddonPromptsDialog
        open={editPromptsOpen}
        onOpenChange={setEditPromptsOpen}
        addon={selectedAddon}
        loading={updatePromptsMutation.isPending}
        onSave={handleSavePrompts}
      />

      {/* Edit meta dialog */}
      <EditAddonMetaDialog
        open={editMetaOpen}
        onOpenChange={setEditMetaOpen}
        addon={selectedAddon}
        loading={updateMetaMutation.isPending}
        onSave={handleSaveMeta}
      />
    </>
  );
};

export default AdminAddonsView;

export const AdminAddonsViewLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminAddonsViewErrorState = () => {
  return <ErrorState title="" description="" />;
};
