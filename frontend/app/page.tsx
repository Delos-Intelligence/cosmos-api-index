// app/page.tsx
import { Metadata } from "next";
import { FileManager } from "@/components/file-manager";
import config from "@/config";
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Cosmos Index
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and analyze your document collections
          </p>
        </header>
        <FileManager initialData={initialData} />
      </div>
    </main>
  );
}
