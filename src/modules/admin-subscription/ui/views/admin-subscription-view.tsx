"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

import { DataPagination } from "@/components/DataPagination";
import { subscriptionColumns } from "../components/columns";
import { useSubscriptionAdminFilters } from "../../hooks/use-admin-subscription";




const AdminSubscriptionsView = () => {
  const [filters, setFilters ] = useSubscriptionAdminFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.adminSubscriptions.getMany.queryOptions({...filters}),
  );
    

  return (
    <div className="flex-1 pb-4  flex flex-col gap-y-4 flex-grow">
     
    <DataTable data={data.items} columns={subscriptionColumns} />
     <DataPagination 
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
       /> 
    </div>
  );
};

export default AdminSubscriptionsView;

export const AdminSubscriptionsViewLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminSubscriptionsViewErrorState = () => {
  return <ErrorState title="" description="" />;
};
