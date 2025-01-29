import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFilesToIndex,
  askQuestion,
  createIndex,
  deleteFilesFromIndex,
  deleteIndex,
  embedIndex,
  getIndexDetails,
  listIndexes,
  renameIndex,
} from "@/app/actions";
import { ApiResponse, BackendIndex, FileItem } from "@/types";

export function useDeleteIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (indexId: string) => deleteIndex(indexId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.indexes });
    },
  });
}

export function useEmbedIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (indexId: string) => embedIndex(indexId),
    onSuccess: (_, indexId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.indexDetails(indexId),
      });
    },
  });
}

export function useDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      indexId,
      fileHashes,
    }: {
      indexId: string;
      fileHashes: string[];
    }) => deleteFilesFromIndex(indexId, fileHashes),
    onSuccess: (_, { indexId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.indexDetails(indexId),
      });
    },
  });
}

export function useRenameIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ indexId, newName }: { indexId: string; newName: string }) =>
      renameIndex(indexId, newName),
    onSuccess: (_, { indexId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.indexes });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.indexDetails(indexId),
      });
    },
  });
}

export function useAskQuestion() {
  return useMutation({
    mutationFn: ({
      indexId,
      question,
      outputLanguage = "en",
      activeFilesHashes = [],
    }: {
      indexId: string;
      question: string;
      outputLanguage?: string;
      activeFilesHashes?: string[];
    }) =>
      askQuestion({
        indexId,
        question,
        outputLanguage,
        activeFilesHashes,
      }),
  });
}

export const QUERY_KEYS = {
  indexes: ["indexes"] as const,
  indexDetails: (indexId: string) => ["index", indexId] as const,
};

export function useIndexes() {
  return useQuery<ApiResponse<{ indices: BackendIndex[] }>>({
    queryKey: QUERY_KEYS.indexes,
    queryFn: async () => {
      const response = await listIndexes();
      return response;
    },
    staleTime: 0,
  });
}
export function useIndexDetails(indexId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.indexDetails(indexId || ""),
    queryFn: async () => {
      const response = await getIndexDetails(indexId!);
      return response;
    },
    enabled: !!indexId,
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createIndex(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.indexes });
    },
  });
}
export function useAddFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ indexId, files }: { indexId: string; files: FileItem[] }) =>
      addFilesToIndex(indexId, files),
    onSuccess: (_, { indexId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.indexDetails(indexId),
      });
    },
  });
}
