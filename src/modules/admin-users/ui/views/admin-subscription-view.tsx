"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { useUsersAdminFilters } from "../../hooks/use-admin-users";
import { DataPagination } from "@/components/DataPagination";
import { authClient } from "@/lib/auth-client.ts";
import { toast } from "sonner";

import { createUserColumns, UserRow } from "../components/columns";
import { BanUserDialog } from "../components/BanUserDialog";
import { ViewUserDialog } from "../components/view-user-dialog";

const AdminSubscriptionView = () => {
  const [filters, setFilters] = useUsersAdminFilters();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  

  const { data } = useSuspenseQuery(
    trpc.adminUsers.getMany.queryOptions({ ...filters }),
  );

  // state for ban modal
  const [banOpenModal, setBanOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserRow | null>(null);

    const handleOpenBanDialog = useCallback((user: UserRow) => {
    setSelectedUser(user);
    setBanOpenModal(true);
  }, []);


  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<UserRow | null>(null);

    const handleOpenDetailsDialog = useCallback((user: UserRow) => {
    setDetailsUser(user);
    setDetailsOpen(true);
  }, []);




  const handleBan  = async (reason: string, durationSeconds?: number) => {
    if (!selectedUser) return;

    const { error } = await authClient.admin.banUser({
      userId: selectedUser.id,
      banReason: reason,
      banExpiresIn: durationSeconds,
    });

    if (error) {
      toast.error("Failed to ban user");
      return;
    }
    await queryClient.invalidateQueries(trpc.adminUsers.getMany.queryOptions({}));

    toast.success("User banned");
    setBanOpenModal(false);
    setSelectedUser(null);

    // refresh users table
    
  };
  const handleUnban = async () => {
    if (!selectedUser) return;

    const { error } = await authClient.admin.unbanUser({
      userId: selectedUser.id,
    });

    if (error) {
      toast.error("Failed to unban user");
      return;
    }
    await queryClient.invalidateQueries(trpc.adminUsers.getMany.queryOptions({}));
    toast.success("User unbanned");
    setBanOpenModal(false);
    setSelectedUser(null);
    
  };

  const columns = useMemo(
    () => createUserColumns({
       onBanClick: handleOpenBanDialog,
       onViewDetailsClick: handleOpenDetailsDialog,
       }),
    [handleOpenBanDialog, handleOpenDetailsDialog],
  );

  return (
    <>
      <div className="flex-1 pb-4 flex flex-col gap-y-4 flex-grow">
        <DataTable data={data.items} columns={columns} />
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>

      <BanUserDialog
        open={banOpenModal}
        onOpenChange={setBanOpenModal}
        user={selectedUser}
        onBan={handleBan}
        onUnban={handleUnban}
      />

      <ViewUserDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={detailsUser}
      />
    </>
  );
};

export default AdminSubscriptionView;

export const AdminUsersViewLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminUsersViewErrorState = () => {
  return <ErrorState title="" description="" />;
};
