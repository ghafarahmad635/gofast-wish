"use client";

import { useEffect, useState } from "react";
import { Search, XCircleIcon, PlusCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCategoriesAdminFilters } from "../../hooks/use-admin-users";
import NewCategoryDialog from "./new-category-dialog";


const CategoriesFilters = () => {
  const [filters, setFilters] = useCategoriesAdminFilters();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
   const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchTerm,
          page: 1,
        }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, filters.search, setFilters]);

  const isModified = !!filters.search;

  const clearFilters = () => {
    setFilters({
      search: null,
      page: 1,
    });
    setSearchTerm("");
  };

  return (
    <>
    <NewCategoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    <ScrollArea>
      <div className="flex items-center gap-x-2 p-1 justify-between">
        {/* Left side: search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, slug, description..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-white w-auto min-w-[260px]"
          />
        </div>

        {/* Right side: buttons */}
        <div className="flex items-center gap-2">
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <XCircleIcon className="h-4 w-4" />
              Clear
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Category
          </Button>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    </>
  );
};

export default CategoriesFilters;
