"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu, PencilIcon, X } from "lucide-react";
import Chat from "@/components/chat";
import CreateIndex from "@/components/create-index";
import Files from "@/components/files";
import {
  useIndexes,
  useIndexDetails,
  useDeleteIndex,
  useEmbedIndex,
  useRenameIndex,
} from "@/hooks/use-queries";

export default function Main() {
  const [selectedIndexId, setSelectedIndexId] = useState<string | null>(null);
  const [newIndexName, setNewIndexName] = useState("");
  const [activeFiles, setActiveFiles] = useState<string[]>([]);
  const [createIndexOpen, setCreateIndexOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: indexesData } = useIndexes();
  const { data: selectedIndexData } = useIndexDetails(selectedIndexId);

  const indexes = indexesData?.data?.indices || [];
  const selectedIndex = selectedIndexData?.data;

  const deleteIndexMutation = useDeleteIndex();
  const embedIndexMutation = useEmbedIndex();
  const renameIndexMutation = useRenameIndex();

  const handleRename = async (indexId: string, newName: string) => {
    await renameIndexMutation.mutateAsync({ indexId, newName });
  };

  useEffect(() => {
    if (window.innerWidth < 768 && selectedIndexId) {
      setIsSidebarOpen(false);
    }
  }, [selectedIndexId]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="border-b bg-white p-4 md:hidden">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">
            {selectedIndex ? selectedIndex.name : "Indexes"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-80 transform bg-white transition-transform md:relative md:translate-x-0`}
      >
        <div className="hidden border-b p-4 md:block">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Indexes</h2>
            <CreateIndex
              isOpen={createIndexOpen}
              onOpenChange={setCreateIndexOpen}
            />
          </div>
        </div>

        <div className="border-b p-4 md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Indexes</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <CreateIndex
            isOpen={createIndexOpen}
            onOpenChange={setCreateIndexOpen}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)] p-4 md:h-[calc(100vh-5rem)]">
          {indexes.map((index) => (
            <div
              key={index.index_uuid}
              onClick={() => setSelectedIndexId(index.index_uuid)}
              className={`mb-2 cursor-pointer rounded-lg p-3 hover:bg-gray-100 ${
                selectedIndexId === index.index_uuid ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{index.name}</span>
                <Badge variant={index.vectorized ? "default" : "secondary"}>
                  {index.vectorized ? "Vectorized" : "Unvectorized"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {index.storage.num_files} files •{" "}
                {index.storage.size_mb.toFixed(2)} MB
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 md:h-screen">
        <div className="p-4 md:p-8">
          {selectedIndex ? (
            <div className="space-y-6">
              <div className="hidden md:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">{selectedIndex.name}</h1>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rename Index</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            defaultValue={selectedIndex.name}
                            onChange={(e) => setNewIndexName(e.target.value)}
                          />
                          <Button
                            onClick={() =>
                              handleRename(selectedIndexId!, newIndexName)
                            }
                          >
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (selectedIndexId) {
                          deleteIndexMutation.mutate(selectedIndexId);
                          setSelectedIndexId(null);
                        }
                      }}
                    >
                      Delete
                    </Button>
                    {!selectedIndex.vectorized && (
                      <Button
                        onClick={() =>
                          selectedIndexId &&
                          embedIndexMutation.mutate(selectedIndexId)
                        }
                      >
                        Embed Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 md:hidden">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedIndexId) {
                      deleteIndexMutation.mutate(selectedIndexId);
                      setSelectedIndexId(null);
                    }
                  }}
                >
                  Delete
                </Button>
                {!selectedIndex.vectorized && (
                  <Button
                    size="sm"
                    onClick={() =>
                      selectedIndexId &&
                      embedIndexMutation.mutate(selectedIndexId)
                    }
                  >
                    Embed Now
                  </Button>
                )}
              </div>

              {selectedIndexId && (
                <>
                  <Files
                    indexId={selectedIndexId}
                    files={selectedIndex.files || []}
                    activeFiles={activeFiles}
                    onActiveFilesChange={setActiveFiles}
                  />
                  <Chat indexId={selectedIndexId} activeFiles={activeFiles} />
                </>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Select an index to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
