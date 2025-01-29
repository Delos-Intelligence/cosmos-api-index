// Types and Interfaces
export interface FileItem {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface Index {
  id: string;
  name: string;
  files: FileItem[];
  messages: Message[];
  isLoading?: boolean;
  vectorized?: boolean;
  storage?: StorageInfo;
  status?: string;
}

interface StorageInfo {
  size_bytes: number;
  size_mb: number;
  num_files: number;
}

export interface Index {
  id: string;
  name: string;
  files: FileItem[];
  messages: Message[];
  isLoading?: boolean;
}
export interface BackendFile {
  file_hash: string;
  filename: string;
  size: number;
}

export interface BackendIndex {
  index_uuid: string;
  name: string;
  files: BackendFile[];
  vectorized: boolean;
  status: string;
  storage: {
    size_bytes: number;
    size_mb: number;
    num_files: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Message {
  content: string;
  role: "user" | "assistant";
}
