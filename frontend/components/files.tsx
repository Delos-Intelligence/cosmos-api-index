"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddFiles, useDeleteFiles } from "@/hooks/use-queries";
import { FileItem } from "@/types";

interface FilesProps {
  indexId: string;
  files: FileItem[];
  activeFiles: string[];
  onActiveFilesChange: (files: string[]) => void;
}

export default function Files({
  indexId,
  files,
  activeFiles,
  onActiveFilesChange,
}: FilesProps) {
  const addFilesMutation = useAddFiles();
  const deleteFilesMutation = useDeleteFiles();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("filesobjects", file);
    });

    try {
      await addFilesMutation.mutateAsync({
        indexId,
        files: files.map((file) => ({
          filename: file.name,
          file_hash: file.name,
          size: file.size,
        })),
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleToggleFile = (fileHash: string, checked: boolean) => {
    onActiveFilesChange(
      checked
        ? [...activeFiles, fileHash]
        : activeFiles.filter((h) => h !== fileHash)
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Files</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Add Files</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {files?.length ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.file_hash}
                className="flex items-center justify-between p-2 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFiles.includes(file.file_hash)}
                    onChange={(e) =>
                      handleToggleFile(file.file_hash, e.target.checked)
                    }
                  />
                  <span>{file.filename}</span>
                  <span className="text-sm text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    deleteFilesMutation.mutate({
                      indexId,
                      fileHashes: [file.file_hash],
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No files in this index. Upload some files to get started.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
