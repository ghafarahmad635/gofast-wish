
import { loadCategoriesSearchParams } from '@/modules/admin-goals-categoires/params'
import CategoriesFilters from '@/modules/admin-goals-categoires/ui/components/categories-filters'
import AdminGoalsCategoriesViews, { AdminGoalsCategoriesViewsErrorState, AdminGoalsCategoriesViewsLoadingState } from '@/modules/admin-goals-categoires/ui/views/admin-gaols-categories-views'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { SearchParams } from 'nuqs/server'
import  { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
interface Props {
  searchParams: Promise<SearchParams>
}
const page = async({searchParams}:Props) => {
     const filter = await loadCategoriesSearchParams(searchParams)
    const queryClient=getQueryClient();
    void queryClient.prefetchQuery(trpc.adminGoalsCategories.getMany.queryOptions({...filter}))
  return (
     <article className="p-4 gap-y-2 grow flex flex-col">
      <CategoriesFilters/>
      <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense fallback={<AdminGoalsCategoriesViewsLoadingState />}>
                <ErrorBoundary fallback={<AdminGoalsCategoriesViewsErrorState />}>
                  <AdminGoalsCategoriesViews/>
                </ErrorBoundary>
              </Suspense>
      
           </HydrationBoundary>
      
    </article>
  )
}

export default page
