"use client";

import Image from "next/image";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddonsView() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.addonsRouter.getMany.queryOptions()
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Available Add ons</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((addon) => (
          <Card
            key={addon.id}
            className="group gap-3 pt-0 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm overflow-hidden"
          >
            {/* Image + overlay badges */}
            {addon.icon?.url ? (
              <div className="relative w-full bg-gray-100">
                <Image
                  src={addon.icon.url}
                  alt={`${addon.name} icon`}
                  width={800}
                  height={450}
                  className="w-full h-auto object-contain"
                />

                {/* Overlay container */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 pointer-events-none">
                  {/* Category badge (left) */}
                  {addon.category && (
                    <span className="pointer-events-auto inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white capitalize">
                      {addon.category}
                    </span>
                  )}

                  {/* Premium badge (right) */}
                  {addon.isPremium && (
                    <span className="pointer-events-auto inline-flex items-center rounded-full bg-yellow-400/90 px-2.5 py-1 text-xs font-semibold text-yellow-950">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                No image
              </div>
            )}

            <CardHeader className="mb-0 gap-0">
              <CardTitle className="text-lg font-semibold ">
                {addon.name}
              </CardTitle>

             
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">
                {addon.description || "No description available."}
              </p>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <Button
                asChild
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Link href={`${addon.url}/${addon.id}`}>Open</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const AddonsViewLoadingState = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-52 bg-gray-100 rounded-xl border border-gray-200 shadow-sm"
          ></div>
        ))}
      </div>
    </div>
  );
};

export const AddonsViewErrorState = () => {
  return (
    <div className="p-6 text-center text-gray-600">
      <p className="text-lg font-medium mb-2">Failed to load add ons</p>
      <p className="text-sm text-gray-500">
        Please refresh or try again later.
      </p>
    </div>
  );
};
