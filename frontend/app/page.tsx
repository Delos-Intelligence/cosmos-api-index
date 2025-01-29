// app/page.tsx
import { Metadata } from "next";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import IndexPage from "@/components/main";
import { listIndexes } from "@/app/actions";
import { QUERY_KEYS } from "@/hooks/use-queries";

export const metadata: Metadata = {
  title: "Cosmos Index - Document Management",
  description: "Manage and interact with your document indexes",
};

export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch the indexes
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.indexes,
    queryFn: listIndexes,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndexPage />
    </HydrationBoundary>
  );
}
