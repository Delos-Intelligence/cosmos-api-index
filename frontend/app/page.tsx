// app/page.tsx
import { Metadata } from "next";
import { FileManager } from "@/components/file-manager";
import config from "@/config";
import CosmosIndexManager from "@/components/main";
import IndexPage from "@/components/main";
export const metadata: Metadata = {
  title: "Cosmos Index - Document Management",
  description: "Manage and interact with your document indexes",
};

async function getInitialIndexes() {
  const response = await fetch(`${config.backendUrl}/files/index/list`);
  if (!response.ok) throw new Error("Failed to fetch indexes");
  return response.json();
}

export default async function Home() {
  const initialData = await getInitialIndexes();

  return <IndexPage />;
}
