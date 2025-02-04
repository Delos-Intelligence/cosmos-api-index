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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Menu, PencilIcon, X, Loader2 } from "lucide-react";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const { data: indexesData } = useIndexes();
  const { data: selectedIndexData, isPending: isIndexDetailsLoading } =
    useIndexDetails(selectedIndexId);

  const indexes = indexesData?.data?.indices || [];
  const selectedIndex = selectedIndexData?.data;

  const deleteIndexMutation = useDeleteIndex();
  const embedIndexMutation = useEmbedIndex();
  const renameIndexMutation = useRenameIndex();

  const handleRename = async (indexId: string, newName: string) => {
    try {
      await renameIndexMutation.mutateAsync({ indexId, newName });
      setRenameDialogOpen(false);
    } catch (error) {
      console.error("Error renaming index:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedIndexId) {
      await deleteIndexMutation.mutateAsync(selectedIndexId);
      setDeleteDialogOpen(false);
      setSelectedIndexId(null);
    }
  };

  useEffect(() => {
    if (window.innerWidth < 768 && selectedIndexId) {
      setIsSidebarOpen(false);
    }
  }, [selectedIndexId]);

  const DeleteDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Index</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &rdquo;{selectedIndex?.name}&rdquo;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteIndexMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteIndexMutation.isPending}
          >
            {deleteIndexMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          {selectedIndexId ? (
            isIndexDetailsLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin " />
                  <p className="text-gray-500">Loading index details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="hidden md:block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h1 className="text-2xl font-bold">
                        {selectedIndex?.name}
                      </h1>
                      <Dialog
                        open={renameDialogOpen}
                        onOpenChange={setRenameDialogOpen}
                      >
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
                              defaultValue={selectedIndex?.name}
                              onChange={(e) => setNewIndexName(e.target.value)}
                              disabled={renameIndexMutation.isPending}
                            />
                            <Button
                              onClick={() =>
                                handleRename(selectedIndexId, newIndexName)
                              }
                              disabled={renameIndexMutation.isPending}
                            >
                              {renameIndexMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete
                      </Button>
                      {!selectedIndex?.vectorized && (
                        <Button
                          onClick={() =>
                            embedIndexMutation.mutate(selectedIndexId)
                          }
                          disabled={embedIndexMutation.isPending}
                        >
                          {embedIndexMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Embedding...
                            </>
                          ) : (
                            "Embed Now"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 md:hidden">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                  {!selectedIndex?.vectorized && (
                    <Button
                      size="sm"
                      onClick={() => embedIndexMutation.mutate(selectedIndexId)}
                      disabled={embedIndexMutation.isPending}
                    >
                      {embedIndexMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Embedding...
                        </>
                      ) : (
                        "Embed Now"
                      )}
                    </Button>
                  )}
                </div>

                {selectedIndex && (
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
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Select an index to view details</p>
            </div>
          )}
        </div>
      </div>
      <DeleteDialog />
    </div>
  );
}
