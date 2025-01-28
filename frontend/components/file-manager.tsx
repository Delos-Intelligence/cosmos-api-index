"use client";

import React, { useState, ChangeEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Pencil,
  Plus,
  RotateCw,
  Send,
  Settings,
  Trash2,
  Upload,
  InfoIcon,
} from "lucide-react";
import config from "@/config";
import { BackendIndex, Index, Message } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IndexCreator from "./index-creator";

interface FileManagerProps {
  initialData: {
    data: {
      indices: BackendIndex[];
    };
  };
}
interface FileInfo {
  name: string;
  size?: number;
  hash?: string;
}
export const FileManager: React.FC<FileManagerProps> = ({ initialData }) => {
  const [indexes, setIndexes] = useState<Index[]>(
    initialData.data.indices.map((backendIndex) => ({
      id: backendIndex.index_uuid,
      name: backendIndex.name,
      files: [],
      messages: [],
      vectorized: backendIndex.vectorized,
      status: backendIndex.status,
      storage: backendIndex.storage,
    }))
  );
  const [currentIndex, setCurrentIndex] = useState<string | null>(
    indexes.length > 0 ? indexes[0].id : null
  );
  const [isCreatingIndex, setIsCreatingIndex] = useState(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [tempIndexName, setTempIndexName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");

  const fetchIndexDetails = async (indexId: string) => {
    try {
      const response = await fetch(
        `${config.backendUrl}/files/index/details/${indexId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch index details");
      }
      const data = await response.json();
      console.log("Index details response:", data); // Debug log

      // Handle both array of strings and array of objects for files
      let processedFiles: FileInfo[] = [];
      if (data.data?.files) {
        processedFiles = data.data.files.map((file: string | FileInfo) => {
          if (typeof file === "string") {
            return { name: file };
          }
          return file;
        });
      }

      setIndexes((prevIndexes) =>
        prevIndexes.map((index) =>
          index.id === indexId
            ? {
                ...index,
                files: processedFiles,
                storage: data.data?.storage || index.storage,
                status: data.data?.status || index.status,
                vectorized: data.data?.vectorized ?? index.vectorized,
              }
            : index
        )
      );
    } catch (err) {
      console.error("Error fetching index details:", err);
      setError("Failed to load index details. Please try again.");
    }
  };

  const fetchIndexes = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/files/index/list`);
      if (!response.ok) {
        throw new Error("Failed to fetch indexes");
      }
      const responseData = await response.json();

      if (responseData.data?.indices) {
        const transformedIndexes: Index[] = responseData.data.indices.map(
          (backendIndex: BackendIndex) => ({
            id: backendIndex.index_uuid,
            name: backendIndex.name,
            files: [],
            messages: [],
            vectorized: backendIndex.vectorized,
            status: backendIndex.status,
            storage: backendIndex.storage,
          })
        );

        setIndexes(transformedIndexes);
        if (transformedIndexes.length > 0 && !currentIndex) {
          setCurrentIndex(transformedIndexes[0].id);
          await fetchIndexDetails(transformedIndexes[0].id);
        }
      }
    } catch (err) {
      setError("Failed to load indexes. Please try again.");
      console.error("Error fetching indexes:", err);
    }
  };

  const getCurrentIndex = () =>
    indexes.find((index) => index.id === currentIndex);

  const handleCreateIndex = () => {
    setIsCreatingIndex(true);
  };

  const handleIndexCreated = (newIndex: Index) => {
    setIndexes((prevIndexes) => [...prevIndexes, newIndex]);
    setCurrentIndex(newIndex.id);
    setIsCreatingIndex(false);
    fetchIndexes();
  };

  const handleSelectIndex = async (indexId: string) => {
    setCurrentIndex(indexId);
    await fetchIndexDetails(indexId);
  };

  const handleEmbedIndex = async (indexId: string) => {
    try {
      const response = await fetch(
        `${config.backendUrl}/files/index/embed/${indexId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to embed index");
      }

      await fetchIndexDetails(indexId);
    } catch (err) {
      console.error("Error embedding index:", err);
      setError("Failed to embed index. Please try again.");
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !currentIndex) return;

    const uploadedFiles = Array.from(event.target.files);
    const formData = new FormData();
    formData.append("index_uuid", currentIndex);
    uploadedFiles.forEach((file) => {
      formData.append("filepaths", file.name);
    });

    setIsUploading(true);
    setError("");

    try {
      const response = await fetch(
        `${config.backendUrl}/files/index/add_files`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            index_uuid: currentIndex,
            filepaths: uploadedFiles.map((file) => file.name),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload files");
      }

      // Refresh the index details after upload
      await fetchIndexDetails(currentIndex);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileIndex: number) => {
    if (!currentIndex) return;

    try {
      const fileToDelete = getCurrentIndex()?.files[fileIndex];
      if (!fileToDelete) return;

      const fileHash = fileToDelete.file_hash;
      if (!fileHash) return;

      // Create plain array with single hash string
      const requestBody = [fileHash.toString()];
      console.log("Final request body:", JSON.stringify(requestBody));

      const response = await fetch(
        `${config.backendUrl}/files/index/delete_files?index_uuid=${currentIndex}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.error_message || "Failed to delete file"
        );
      }

      await fetchIndexDetails(currentIndex);
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const handleDeleteIndex = async () => {
    if (!currentIndex) return;

    try {
      const response = await fetch(
        `${config.backendUrl}/files/index/${currentIndex}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete index");
      }

      setIndexes(indexes.filter((index) => index.id !== currentIndex));
      setCurrentIndex(indexes.length > 1 ? indexes[0].id : null);
    } catch (err) {
      console.error("Error deleting index:", err);
      setError("Failed to delete index. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentIndex) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const currentIdx = getCurrentIndex();
    if (!currentIdx) return;

    const existingMessages = [...(currentIdx.messages || [])];
    existingMessages.push(userMessage);

    setIndexes(
      indexes.map((index) =>
        index.id === currentIndex
          ? {
              ...index,
              messages: existingMessages,
              isLoading: true,
            }
          : index
      )
    );

    try {
      const url = new URL(`${config.backendUrl}/files/index/ask`);
      url.searchParams.append("index_uuid", currentIndex);
      url.searchParams.append("question", inputMessage);
      url.searchParams.append("output_language", "en");
      url.searchParams.append("active_files_hashes", "[]");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([]),
      });

      const data = await response.json();
      setInputMessage("");

      if (data.status === "success" && data.data?.answer) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.data.answer,
          timestamp: new Date().toISOString(),
        };

        existingMessages.push(assistantMessage);
      } else {
        let errorMessage = "An error occurred while processing your request.";

        if (data.error?.details) {
          errorMessage = data.error.details;
        } else if (data.error?.error_message) {
          errorMessage = data.error.error_message;
        } else if (data.message) {
          errorMessage = data.message;
        }

        const errorResponse: Message = {
          role: "assistant",
          content: errorMessage,
          timestamp: new Date().toISOString(),
          isError: true,
        };

        existingMessages.push(errorResponse);
      }

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex
            ? {
                ...index,
                messages: existingMessages,
                isLoading: false,
              }
            : index
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);

      existingMessages.push({
        role: "assistant",
        content: "Sorry, there was a network error. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true,
      });

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex
            ? {
                ...index,
                messages: existingMessages,
                isLoading: false,
              }
            : index
        )
      );
    }
  };

  const startRenaming = () => {
    setTempIndexName(getCurrentIndex()?.name || "");
    setIsRenaming(true);
  };

  const handleRenameIndex = async (newName: string) => {
    if (!currentIndex || !newName.trim()) {
      setIsRenaming(false);
      return;
    }

    try {
      const url = new URL(`${config.backendUrl}/files/index/rename`);
      url.searchParams.append("index_uuid", currentIndex);
      url.searchParams.append("name", newName.trim());

      const response = await fetch(url.toString(), {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to rename index");
      }

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex ? { ...index, name: newName.trim() } : index
        )
      );
      setIsRenaming(false);
    } catch (err) {
      console.error("Error renaming index:", err);
      setError("Failed to rename index. Please try again.");
    }
  };

  console.log(indexes, "indexes");

  return (
    <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Left sidebar */}
      <div className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Indexes</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchIndexes}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2">
                {indexes.map((index) => (
                  <div key={index.id} className="group relative">
                    <Button
                      variant={currentIndex === index.id ? "default" : "ghost"}
                      className="w-full justify-between"
                      onClick={() => handleSelectIndex(index.id)}
                    >
                      <span className="truncate">{index.name}</span>
                      {!index.vectorized && (
                        <span className="text-xs text-yellow-500 ml-2">
                          Processing
                        </span>
                      )}
                    </Button>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={startRenaming}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDeleteIndex}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={handleCreateIndex}
                className="w-full mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Index
              </Button>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="col-span-3">
        {currentIndex ? (
          <div className="space-y-6">
            {/* Index details card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                  {isRenaming ? (
                    <Input
                      className="max-w-xs"
                      value={tempIndexName}
                      onChange={(e) => setTempIndexName(e.target.value)}
                      onBlur={() => handleRenameIndex(tempIndexName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameIndex(tempIndexName);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle>{getCurrentIndex()?.name}</CardTitle>
                      {getCurrentIndex()?.vectorized ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Index is fully vectorized</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Index is being processed</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmbedIndex(currentIndex)}
                          disabled={getCurrentIndex()?.vectorized}
                        >
                          <RotateCw className="h-4 w-4 mr-2" />
                          Vectorize
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {getCurrentIndex()?.vectorized
                            ? "Index is already vectorized"
                            : "Vectorize index for better results"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("manager-file-upload")?.click()
                    }
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Files"}
                  </Button>
                  <input
                    id="manager-file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {getCurrentIndex()?.files.map((file, idx) => (
                    <div
                      key={`file-${file.name}-${idx}`}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium truncate">
                          {file.filename}
                        </span>
                        {file.size && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(idx)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {getCurrentIndex()?.files.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Upload className="h-12 w-12 mb-4 opacity-50" />
                      <p>No files uploaded yet</p>
                      <p className="text-sm">
                        Click the upload button to add files to this index
                      </p>
                    </div>
                  )}

                  {getCurrentIndex()?.storage && (
                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">
                        Storage Information
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Size
                          </p>
                          <p className="font-medium">
                            {getCurrentIndex()?.storage?.size_mb.toFixed(2)} MB
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Files
                          </p>
                          <p className="font-medium">
                            {getCurrentIndex()?.storage?.num_files} files
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Status
                          </p>
                          <p className="font-medium capitalize">
                            {getCurrentIndex()?.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat card */}
            <Card className="h-[calc(100vh-26rem)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle>Chat with Index</CardTitle>
                  </div>
                  {!getCurrentIndex()?.vectorized && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-yellow-500">
                            <InfoIcon className="h-4 w-4" />
                            <span className="text-sm">
                              Not fully vectorized
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Some questions may not be answered accurately until
                            vectorization is complete
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-full flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {getCurrentIndex()?.messages?.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.isError
                                ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                                : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {getCurrentIndex()?.isLoading && (
                      <div className="flex items-center justify-center p-4 text-muted-foreground">
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={getCurrentIndex()?.isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {!getCurrentIndex()?.vectorized && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Note: For best results, consider vectorizing your index
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No index selected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create a new index or select an existing one to get started
              </p>
              <Button onClick={handleCreateIndex}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Index
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal for creating new index */}
      {isCreatingIndex && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <IndexCreator
              onCreated={handleIndexCreated}
              onCancel={() => setIsCreatingIndex(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
