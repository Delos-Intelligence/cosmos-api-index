import { useState } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAddFiles,
  useDeleteFiles,
  useRestoreIndex,
} from "@/hooks/use-queries";
import { FileItem } from "@/types/types";
import { Loader2, X, TimerOff } from "lucide-react";

interface FilesProps {
  indexId: string;
  files: FileItem[];
  activeFiles: string[];
  onActiveFilesChange: (files: string[]) => void;
  isCountdown?: boolean;
}

export default function Files({
  indexId,
  files,
  activeFiles,
  onActiveFilesChange,
  isCountdown = false,
}: FilesProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addFilesMutation = useAddFiles();
  const deleteFilesMutation = useDeleteFiles();
  const restoreIndexMutation = useRestoreIndex(indexId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadConfirm = async () => {
    if (isCountdown) return;
    try {
      await addFilesMutation.mutateAsync({
        indexId,
        files: selectedFiles.map((file) => ({
          filename: file.name,
          file_hash: file.name,
          size: file.size,
          fileObject: file,
        })),
      });
      setSelectedFiles([]);
      setIsDialogOpen(false);
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
          {!isCountdown && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Add Files</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="cursor-pointer"
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFiles([]);
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadConfirm}
                    disabled={
                      selectedFiles.length === 0 || addFilesMutation.isPending
                    }
                  >
                    {addFilesMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      `Upload ${selectedFiles.length ? `(${selectedFiles.length})` : ""}`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isCountdown && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center">
                <TimerOff className="mr-2 h-4 w-4" />
                This index is scheduled for deletion
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restoreIndexMutation.mutate(indexId)}
                disabled={restoreIndexMutation.isPending}
                className="ml-4 bg-white hover:bg-white/90"
              >
                {restoreIndexMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  "Restore Index"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {files?.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.file_hash}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeFiles.includes(file.file_hash)}
                    onChange={(e) =>
                      handleToggleFile(file.file_hash, e.target.checked)
                    }
                    disabled={isCountdown}
                  />
                  <span>{file.filename}</span>
                  <span className="text-sm text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                {!isCountdown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteFilesMutation.mutate({
                        indexId,
                        fileHashes: [file.file_hash],
                      })
                    }
                    disabled={deleteFilesMutation.isPending}
                  >
                    {deleteFilesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                )}
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
