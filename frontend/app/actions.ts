"use server";

import { BackendIndex, FileItem, IndexDetailsResponse, Message } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data: T;
  status?: string;
  error?: {
    error_message?: string;
    details?: string;
  };
}

export async function listIndexes(): Promise<
  ApiResponse<{ indices: BackendIndex[] }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/files/index/list`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch indexes");
    }

    return response.json();
  } catch (error) {
    console.error("Error in listIndexes:", error);
    throw error;
  }
}

export async function getIndexDetails(
  indexId: string
): Promise<ApiResponse<IndexDetailsResponse>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files/index/details/${indexId}`,
      { cache: "no-store" }
    );

    if (!response.ok) throw new Error("Failed to fetch index details");
    return response.json();
  } catch (error) {
    console.error("Error in getIndexDetails:", error);
    throw error;
  }
}

export async function createIndex(
  formData: FormData
): Promise<ApiResponse<BackendIndex>> {
  try {
    console.log(formData, "formData");

    const response = await fetch(`${API_BASE_URL}/files/index/create`, {
      method: "POST",

      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to create index");
    }

    return response.json();
  } catch (error) {
    console.error("Error in createIndex:", error);
    throw error;
  }
}

export async function deleteIndex(indexId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/files/index/${indexId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete index");
    }

    return response.json();
  } catch (error) {
    console.error("Error in deleteIndex:", error);
    throw error;
  }
}

export async function embedIndex(
  indexId: string
): Promise<ApiResponse<{ vectorized: boolean }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files/index/embed/${indexId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to embed index");
    }

    return response.json();
  } catch (error) {
    console.error("Error in embedIndex:", error);
    throw error;
  }
}

export async function addFilesToIndex(
  indexId: string,
  files: FileItem[]
): Promise<
  ApiResponse<{
    files: FileItem[];
  }>
> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files/index/add_files?index_uuid=${indexId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(files.map((f) => f.name)),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add files");
    }

    return response.json();
  } catch (error) {
    console.error("Error in addFilesToIndex:", error);
    throw error;
  }
}

export async function deleteFilesFromIndex(
  indexId: string,
  fileHashes: string[]
): Promise<
  ApiResponse<{
    deleted: string[];
  }>
> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files/index/delete_files?index_uuid=${indexId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fileHashes),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete files");
    }

    return response.json();
  } catch (error) {
    console.error("Error in deleteFilesFromIndex:", error);
    throw error;
  }
}

export async function renameIndex(
  indexId: string,
  newName: string
): Promise<ApiResponse<BackendIndex>> {
  try {
    const url = new URL(`${API_BASE_URL}/files/index/rename`);
    url.searchParams.append("index_uuid", indexId);
    url.searchParams.append("name", newName);

    const response = await fetch(url.toString(), {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Failed to rename index");
    }

    return response.json();
  } catch (error) {
    console.error("Error in renameIndex:", error);
    throw error;
  }
}

export async function askQuestion(params: {
  indexId: string;
  question: string;
  outputLanguage?: string;
  activeFilesHashes?: string[];
}): Promise<
  ApiResponse<{
    answer: string;
    message?: Message;
  }>
> {
  try {
    const url = new URL(`${API_BASE_URL}/files/index/ask`);
    url.searchParams.append("index_uuid", params.indexId);
    url.searchParams.append("question", params.question);
    url.searchParams.append("output_language", params.outputLanguage || "en");
    url.searchParams.append(
      "active_files_hashes",
      JSON.stringify(params.activeFilesHashes || [])
    );

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([]),
    });

    if (!response.ok) {
      throw new Error("Failed to get answer");
    }

    return response.json();
  } catch (error) {
    console.error("Error in askQuestion:", error);
    throw error;
  }
}
