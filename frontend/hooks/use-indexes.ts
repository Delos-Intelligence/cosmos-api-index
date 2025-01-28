// use-indexes.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import config from "@/config";
import { BackendIndex, Index } from "@/types";

// Query keys
const queryKeys = {
  indexes: ["indexes"],
  indexDetails: (indexId: string) => ["indexes", indexId],
};

const transformBackendIndex = (backendIndex: BackendIndex): Index => ({
  id: backendIndex.index_uuid,
  name: backendIndex.name,
  files: backendIndex.files.map((file) => ({
    name: file.filename,
    size: file.size,
    hash: file.file_hash,
  })),
  messages: [],
  vectorized: backendIndex.vectorized,
  status: backendIndex.status,
  storage: backendIndex.storage,
});

export const useIndexes = () => {
  const queryClient = useQueryClient();

  const indexesQuery = useQuery({
    queryKey: queryKeys.indexes,
    queryFn: async () => {
      const response = await fetch(`${config.backendUrl}/files/index/list`);
      if (!response.ok) throw new Error("Failed to fetch indexes");
      const data = await response.json();
      return data.data.indices.map(transformBackendIndex);
    },
  });

  const useIndexDetails = (indexId: string) =>
    useQuery({
      queryKey: queryKeys.indexDetails(indexId),
      queryFn: async () => {
        const response = await fetch(
          `${config.backendUrl}/files/index/details/${indexId}`
        );
        if (!response.ok) throw new Error("Failed to fetch index details");
        const data = await response.json();
        return transformBackendIndex(data.data);
      },
      enabled: !!indexId,
    });

  const embedMutation = useMutation({
    mutationFn: async (indexId: string) => {
      const response = await fetch(
        `${config.backendUrl}/files/index/embed/${indexId}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to embed index");
      return response.json();
    },
    onSuccess: (_, indexId) => {
      queryClient.invalidateQueries(queryKeys.indexDetails(indexId));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (indexId: string) => {
      const response = await fetch(
        `${config.backendUrl}/files/index/${indexId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete index");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.indexes);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ files }: { indexId: string; files: File[] }) => {
      const formData = new FormData();
      formData.append("name", "");
      files.forEach((file) => formData.append("filesobjects", file));

      const response = await fetch(
        `${config.backendUrl}/files/index/add_files`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Failed to upload files");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(queryKeys.indexDetails(variables.indexId));
    },
  });

  const renameIndex = async (indexId: string, newName: string) => {
    const url = new URL(`${config.backendUrl}/files/index/rename`);
    url.searchParams.append("index_uuid", indexId);
    url.searchParams.append("name", newName.trim());

    const response = await fetch(url.toString(), { method: "PUT" });
    if (!response.ok) throw new Error("Failed to rename index");

    queryClient.invalidateQueries(queryKeys.indexes);
    queryClient.invalidateQueries(queryKeys.indexDetails(indexId));
  };

  return {
    indexes: indexesQuery.data,
    indexesLoading: indexesQuery.isLoading,
    indexDetails: useIndexDetails,
    embedIndex: embedMutation.mutateAsync,
    deleteIndex: deleteMutation.mutateAsync,
    uploadFiles: uploadMutation.mutateAsync,
    renameIndex,
    isEmbedding: embedMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadMutation.isPending,
  };
};
