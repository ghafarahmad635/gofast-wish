"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { columns } from "../components/columns";
import { useUsersAdminFilters } from "../../hooks/use-admin-users";
import { DataPagination } from "@/components/DataPagination";



const AdminUsersView = () => {
    const [filters, setFilters] = useUsersAdminFilters();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.adminUsers.getMany.queryOptions({...filters}),
  );
    

  return (
    <div className="flex-1 pb-4  flex flex-col gap-y-4 flex-grow">
      <DataTable data={data.items} columns={columns} />
      <DataPagination 
         page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
       />
    </div>
  );
};

export default AdminUsersView;

export const AdminUsersViewLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminUsersViewErrorState = () => {
  return <ErrorState title="" description="" />;
};
