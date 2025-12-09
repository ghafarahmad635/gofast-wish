import { ReactNode, useState } from "react";
import { ChevronsUpDownIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";

interface Props {
  options: Array<{
    id: string;
    value: string;
    children: ReactNode;
  }>;
  onSelect: (value: string) => void;
  onSearch?: (value: string) => void;
  value: string;
  placeholder?: string;
  isSearchable?: boolean;
  className?: string;
  isLoading?: boolean;
}

export const CommandSelect = ({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "Select an option",
  className,
  isSearchable = true,
  isLoading = false,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // when closing, reset search if consumer provided onSearch
      onSearch?.("");
    }
    setOpen(open);
  };

  const showPlaceholder =
    !selectedOption && (isLoading ? "Loading..." : placeholder);

  return (
    <>
      <Button
        onClick={() => !isLoading && setOpen(true)}
        type="button"
        variant="outline"
        disabled={isLoading}
        className={cn(
          "h-9 justify-between font-normal px-2",
          !selectedOption && "text-muted-foreground",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {isLoading && !selectedOption && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {selectedOption?.children ?? showPlaceholder}
        </div>
        <ChevronsUpDownIcon className="h-4 w-4" />
      </Button>

      <CommandResponsiveDialog
        shouldFilter={!onSearch}
        open={open}
        onOpenChange={handleOpenChange}
      >
        {isSearchable && (
          <CommandInput placeholder="Search..." onValueChange={onSearch} />
        )}
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading options...
            </div>
          ) : (
            <>
              <CommandEmpty>
                <span className="text-muted-foreground text-sm">
                  No options found
                </span>
              </CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  {option.children}
                </CommandItem>
              ))}
            </>
          )}
        </CommandList>
      </CommandResponsiveDialog>
    </>
  );
};
