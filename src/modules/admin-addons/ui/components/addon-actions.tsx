
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ToggleLeft, ToggleRight, Pencil, FileText } from "lucide-react";
import { GetManyAddons } from "../../types";


export type AddonRow = GetManyAddons[number];

type AddonActionsProps = {
  addon: AddonRow;
  onToggleConfirm: (addon: AddonRow) => void;
  onEditMeta: (addon: AddonRow) => void;
  onEditPrompts: (addon: AddonRow) => void;
};

const AddonActions = ({
  addon,
  onToggleConfirm,
  onEditMeta,
  onEditPrompts,
}: AddonActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onEditMeta(addon)}>
          <Pencil className="size-3 mr-2" />
          Edit details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEditPrompts(addon)}>
          <FileText className="size-3 mr-2" />
          Edit prompts
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onToggleConfirm(addon)}>
          {addon.isEnabled ? (
            <>
              <ToggleLeft className="size-3 mr-2" />
              Disable
            </>
          ) : (
            <>
              <ToggleRight className="size-3 mr-2" />
              Enable
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddonActions;
