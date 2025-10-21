"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoalsFilters } from "../../hooks/use-goals-filters";

import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

export const GoalsSearchFilter = () => {
  const [filters, setFilters] = useGoalsFilters();
  const [searchTerm, setSearchTerm] = useState(filters.search);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // ✅ Update filter when debounce finishes
  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  // ✅ Sync input when filters are externally cleared
  useEffect(() => {
    
    setSearchTerm(filters.search);
  }, [filters.search]);

  return (
    <div className="relative">
      <Input
        placeholder="Filter by Title & Description"
        className="h-9 bg-white w-[400px] pl-7"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
};
