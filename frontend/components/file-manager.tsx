"use client";

// components/file-manager.tsx

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Link,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";

interface FileItem {
  name: string;
  size: number;
  type: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Index {
  id: string;
  name: string;
  files: FileItem[];
  messages: Message[];
  isLoading?: boolean;
}

const ChatDialog: React.FC<{
  index: Index;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (indexId: string, message: string) => void;
}> = ({ index, isOpen, onClose, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(index.id, inputMessage);
    setInputMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat with {index.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[400px] pr-4">
            {index.messages.map((message, idx) => (
              <div
                key={idx}
                className={`mb-4 ${
                  message.role === "user" ? "ml-auto" : "mr-auto"
                } max-w-[80%]`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {index.isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                Thinking...
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={index.isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const IndexCreator: React.FC<{
  onCreated: (newIndex: Index) => void;
  onCancel: () => void;
}> = ({ onCreated, onCancel }) => {
  const [indexData, setIndexData] = useState({
    name: "",
    files: [] as FileItem[],
    isSaving: false,
    error: "",
  });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setIndexData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  const handleRemoveFile = (fileIndex: number) => {
    setIndexData((prev) => ({
      ...prev,
      files: prev.files.filter((_, idx) => idx !== fileIndex),
    }));
  };

  const handleSave = async () => {
    if (!indexData.name.trim()) {
      setIndexData((prev) => ({
        ...prev,
        error: "Please provide an index name",
      }));
      return;
    }

    setIndexData((prev) => ({ ...prev, isSaving: true, error: "" }));

    try {
      const response = await fetch("http://localhost:8000/files/index/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: indexData.name,
          filepaths: indexData.files.map((f) => f.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create index");
      }

      const newIndex = await response.json();
      onCreated(newIndex);
    } catch (err) {
      setIndexData((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to create index",
      }));
    } finally {
      setIndexData((prev) => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create New Index</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Index Name"
            value={indexData.name}
            onChange={(e) =>
              setIndexData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("fileUpload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Files
          </Button>
          <input
            id="fileUpload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {indexData.files.length > 0 && (
          <div className="space-y-2">
            {indexData.files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {indexData.error && (
          <Alert variant="destructive">
            <AlertDescription>{indexData.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={indexData.isSaving}>
            {indexData.isSaving ? "Creating..." : "Create Index"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FileManager: React.FC = () => {
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [currentIndex, setCurrentIndex] = useState<string | null>(null);
  const [isCreatingIndex, setIsCreatingIndex] = useState(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [tempIndexName, setTempIndexName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    // Fetch initial indexes from backend
    const fetchIndexes = async () => {
      try {
        const response = await fetch("http://localhost:8000/files/index/list");
        const data = await response.json();

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setIndexes(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError("Failed to load indexes. Please try again.");
      }
    };

    fetchIndexes();
  }, []);

  const getCurrentIndex = () =>
    indexes.find((index) => index.id === currentIndex);

  const handleCreateIndex = () => {
    setIsCreatingIndex(true);
  };

  const handleIndexCreated = (newIndex: Index) => {
    setIndexes([...indexes, newIndex]);
    setCurrentIndex(newIndex.id);
    setIsCreatingIndex(false);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !currentIndex) return;

    const uploadedFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setIsUploading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/files/index/add_files`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            index_uuid: currentIndex,
            filepaths: uploadedFiles.map((f) => f.name),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload files");
      }

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex
            ? { ...index, files: [...index.files, ...uploadedFiles] }
            : index,
        ),
      );
    } catch (err) {
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

      await fetch(`http://localhost:8000/files/index/delete_files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index_uuid: currentIndex,
          files_hashes: [fileToDelete.name],
        }),
      });

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex
            ? {
                ...index,
                files: index.files.filter((_, idx) => idx !== fileIndex),
              }
            : index,
        ),
      );
    } catch (err) {
      setError("Failed to delete file. Please try again.");
    }
  };

  const handleDeleteIndex = async () => {
    if (!currentIndex) return;

    try {
      const response = await fetch(
        `http://localhost:8000/files/index/${currentIndex}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete index");
      }

      setIndexes(indexes.filter((index) => index.id !== currentIndex));
      setCurrentIndex(indexes.length > 1 ? indexes[0].id : null);
    } catch (err) {
      setError("Failed to delete index. Please try again.");
    }
  };

  const handleSendMessage = async (indexId: string, message: string) => {
    setIndexes(
      indexes.map((index) => {
        if (index.id === indexId) {
          return {
            ...index,
            messages: [...index.messages, { role: "user", content: message }],
            isLoading: true,
          };
        }
        return index;
      }),
    );

    try {
      const response = await fetch("http://localhost:8000/files/index/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          index_uuid: indexId,
          question: message,
          output_language: "en", // You might want to make this configurable
          active_files_hashes:
            getCurrentIndex()?.files.map((f) => f.name) || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const responseData = await response.json();

      setIndexes(
        indexes.map((index) => {
          if (index.id === indexId) {
            return {
              ...index,
              messages: [
                ...index.messages,
                { role: "user", content: message },
                {
                  role: "assistant",
                  content: responseData.answer || responseData.toString(),
                },
              ],
              isLoading: false,
            };
          }
          return index;
        }),
      );
    } catch (error) {
      setIndexes(
        indexes.map((index) => {
          if (index.id === indexId) {
            return {
              ...index,
              messages: [
                ...index.messages,
                {
                  role: "assistant",
                  content: "Sorry, there was an error processing your request.",
                },
              ],
              isLoading: false,
            };
          }
          return index;
        }),
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
      const response = await fetch("http://localhost:8000/files/index/rename", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          index_uuid: currentIndex,
          name: newName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename index");
      }

      setIndexes(
        indexes.map((index) =>
          index.id === currentIndex
            ? { ...index, name: newName.trim() }
            : index,
        ),
      );
      setIsRenaming(false);
    } catch (err) {
      setError("Failed to rename index. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left column for index list */}
      <div className="w-1/4 p-4 border-r">
        <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-4rem)] pr-4">
          {indexes.map((index) => (
            <Button
              key={index.id} // Use the unique UUID as the key
              variant={currentIndex === index.id ? "default" : "outline"}
              onClick={() => setCurrentIndex(index.id)}
              className="w-full text-left justify-start"
            >
              {index.name}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={handleCreateIndex}
            className="w-full text-left justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Index
          </Button>
        </div>
      </div>

      {/* Right column for index content */}
      <div className="w-3/4 p-4 overflow-y-auto">
        {currentIndex ? (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                {isRenaming ? (
                  <Input
                    className="max-w-xs"
                    value={tempIndexName}
                    onChange={(e) => setTempIndexName(e.target.value)}
                    onBlur={() => handleRenameIndex(tempIndexName)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleRenameIndex(tempIndexName);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <CardTitle>{getCurrentIndex()?.name}</CardTitle>
                )}
                <Button variant="ghost" size="icon" onClick={startRenaming}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
                <input
                  id="fileUpload"
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
                {getCurrentIndex()?.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span className="font-medium">{file.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsChatOpen(true)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {getCurrentIndex()?.files.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No files uploaded yet. Click the upload button to add files.
                  </div>
                )}
                {getCurrentIndex() && getCurrentIndex()!.files.length > 0 && (
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Index
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteIndex}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Index
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click "New Index" to create your first index
          </div>
        )}
      </div>

      {currentIndex && getCurrentIndex() && (
        <ChatDialog
          index={getCurrentIndex()!}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSendMessage={handleSendMessage}
        />
      )}

      {isCreatingIndex && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <IndexCreator
            onCreated={handleIndexCreated}
            onCancel={() => setIsCreatingIndex(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FileManager;
