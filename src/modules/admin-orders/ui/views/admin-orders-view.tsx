"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

import { DataPagination } from "@/components/DataPagination";

import { useOrdersAdminFilters } from "../../hooks/use-admin-orders";
import { columns } from "../components/columns";





const AdminOrdersView = () => {
  const [filters, setFilters ] = useOrdersAdminFilters ();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.adminOrders.getMany.queryOptions({...filters}),
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

export default AdminOrdersView;

export const AdminOrdersViewLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminOrdersViewErrorState = () => {
  return <ErrorState title="" description="" />;
};
