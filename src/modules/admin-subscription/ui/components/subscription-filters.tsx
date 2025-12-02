"use client";

import { useEffect, useState } from "react";
import { Search, XCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSubscriptionAdminFilters } from "../../hooks/use-admin-subscription";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../types";

const SubscriptionFilters = () => {
  const [filters, setFilters] = useSubscriptionAdminFilters();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // debounce search
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

  const isModified =
    !!filters.search ||
    !!filters.plan ||
    !!filters.status;

  const clearFilters = () => {
    setFilters({
      search: null,
      plan: null,
      status: null,
      page: 1,
    });
    setSearchTerm("");
  };

  return (
    <ScrollArea>
      <div className="flex items-center gap-x-2 p-1 justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-white w-auto min-w-[250px]"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-x-2 items-center">
          {/* Plan */}
          <Select
            // when filters.plan is null → use "all"
            value={filters.plan ?? "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setFilters({ plan: null, page: 1 });
              } else {
                setFilters({
                  plan: value as SubscriptionPlan,
                  page: 1,
                });
              }
            }}
          >
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setFilters({ status: null, page: 1 });
              } else {
                setFilters({
                  status: value as SubscriptionStatus,
                  page: 1,
                });
              }
            }}
          >
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>

          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <XCircleIcon className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default SubscriptionFilters;
