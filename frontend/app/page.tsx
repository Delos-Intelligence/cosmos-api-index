// app/page.tsx
import { FileManager } from "@/components/file-manager";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cosmos Index</h1>
        <FileManager />
      </div>
    </main>
  );
}
