export interface FileItem {
  name?: string;
  filename: string;
  file_hash: string;
  size: number;
}

export interface StorageInfo {
  size_bytes: number;
  size_mb: number;
  num_files: number;
}

export interface IndexDetailsResponse {
  name: string;
  files: FileItem[];
  storage: StorageInfo;
  status: string;
  vectorized: boolean;
}

export interface BackendIndex {
  index_uuid: string;
  name: string;
  storage: StorageInfo;
  vectorized: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  status?: string;
  error?: {
    error_message?: string;
    details?: string;
  };
}
export interface Message {
  role: "user" | "assistant";
  content: string;
}
