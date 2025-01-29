"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Message } from "@/types";
import {
  useIndexes,
  useIndexDetails,
  useCreateIndex,
  useDeleteIndex,
  useEmbedIndex,
  useAddFiles,
  useDeleteFiles,
  useRenameIndex,
  useAskQuestion,
} from "@/hooks/use-queries";

export default function IndexPage() {
  const [selectedIndexId, setSelectedIndexId] = useState<string | null>(null);
  const [newIndexName, setNewIndexName] = useState("");
  const [question, setQuestion] = useState("");
  const [activeFiles, setActiveFiles] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [createIndexOpen, setCreateIndexOpen] = useState(false);

  const { data: indexesData } = useIndexes();
  const { data: selectedIndexData } = useIndexDetails(selectedIndexId);

  const indexes = indexesData?.data?.indices || [];
  const selectedIndex = selectedIndexData?.data;

  const createIndexMutation = useCreateIndex();
  const deleteIndexMutation = useDeleteIndex();
  const embedIndexMutation = useEmbedIndex();
  const addFilesMutation = useAddFiles();
  const deleteFilesMutation = useDeleteFiles();
  const renameIndexMutation = useRenameIndex();
  const askQuestionMutation = useAskQuestion();

  const handleCreateIndex = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const fileInput = formData.get("files") as File;

    if (!name || !fileInput) {
      console.error("Name and file are required");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", name);
    submitData.append("filesobjects", fileInput);

    try {
      await createIndexMutation.mutateAsync(submitData);
      setCreateIndexOpen(false);
    } catch (error) {
      console.error("Error creating index:", error);
    }
  };

  const handleRename = async (indexId: string, newName: string) => {
    await renameIndexMutation.mutateAsync({ indexId, newName });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedIndexId || !e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("filesobjects", file);
    });

    try {
      await addFilesMutation.mutateAsync({
        indexId: selectedIndexId,
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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndexId || !question) return;
    setQuestion("");
    const newMessage: Message = { content: question, role: "user" };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await askQuestionMutation.mutateAsync({
        indexId: selectedIndexId,
        question,
        activeFilesHashes: activeFiles,
      });

      const answerMessage: Message = {
        content: response.data.answer,
        role: "assistant",
      };
      setMessages((prev) => [...prev, answerMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        content: "Failed to get answer. Please try again.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 border-r bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Indexes</h2>
          <Dialog open={createIndexOpen} onOpenChange={setCreateIndexOpen}>
            <DialogTrigger asChild>
              <Button size="sm">New Index</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Index</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateIndex}>
                <div className="space-y-4">
                  <Input name="name" placeholder="Index Name" required />
                  <Input
                    name="files"
                    type="file"
                    multiple
                    className="cursor-pointer"
                    required
                  />
                  <Button type="submit" className="w-full">
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
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

      <div className="flex-1 p-8">
        {selectedIndex ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">{selectedIndex.name}</h1>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ✏️
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
                {selectedIndex.files?.length ? (
                  <div className="space-y-2">
                    {selectedIndex.files.map((file) => (
                      <div
                        key={file.file_hash}
                        className="flex items-center justify-between p-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={activeFiles.includes(file.file_hash)}
                            onChange={(e) => {
                              setActiveFiles((prev) =>
                                e.target.checked
                                  ? [...prev, file.file_hash]
                                  : prev.filter((h) => h !== file.file_hash)
                              );
                            }}
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
                              indexId: selectedIndexId!,
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

            <Card className="h-[450px]">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-50 ml-auto w-3/4"
                          : "bg-gray-100 w-3/4"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <form
                  onSubmit={handleAskQuestion}
                  className="flex w-full gap-2"
                >
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question..."
                  />
                  <Button type="submit">Send</Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Select an index to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
