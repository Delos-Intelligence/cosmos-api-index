"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Trash2, Upload } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import config from "@/config";
import { FileItem, Index } from "@/types";
// Index Creator Component
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
      file,
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

    if (indexData.files.length === 0) {
      setIndexData((prev) => ({
        ...prev,
        error: "Please select at least one file",
      }));
      return;
    }

    setIndexData((prev) => ({ ...prev, isSaving: true, error: "" }));

    try {
      const formData = new FormData();
      formData.append("name", indexData.name);
      indexData.files.forEach((fileItem) => {
        formData.append("filesobjects", fileItem.file);
      });

      const response = await fetch(`${config.backendUrl}/files/index/create`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create index");
      }

      const data = await response.json();
      const newIndex: Index = {
        id: data.index_uuid,
        name: indexData.name,
        files: indexData.files,
        messages: [],
      };

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
            onClick={() =>
              document.getElementById("creator-file-upload")?.click()
            }
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Files
          </Button>
          <input
            id="creator-file-upload"
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

export default IndexCreator;
