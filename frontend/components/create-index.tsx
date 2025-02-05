"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateIndex } from "@/hooks/use-queries";
import { Loader2, X } from "lucide-react";

interface CreateIndexProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateIndex({
  isOpen,
  onOpenChange,
}: CreateIndexProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const createIndexMutation = useCreateIndex();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateIndex = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name || selectedFiles.length === 0) {
      console.error("Name and at least one file are required");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", name);
    selectedFiles.forEach((file) => {
      submitData.append("filesobjects", file);
    });

    try {
      await createIndexMutation.mutateAsync(submitData);
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating index:", error);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New Index</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Index</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateIndex}>
          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Index Name"
              required
              disabled={createIndexMutation.isPending}
            />
            <Input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="cursor-pointer"
              disabled={createIndexMutation.isPending}
            />
            {selectedFiles.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createIndexMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  selectedFiles.length === 0 || createIndexMutation.isPending
                }
              >
                {createIndexMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create${selectedFiles.length ? ` (${selectedFiles.length} files)` : ""}`
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
