// Types and Interfaces
export interface FileItem {
  file: File;
  name: string;
  size: number;
  type: string;
}

/* export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isError?: boolean;
  action?: () => void;
  actionLabel?: string;
} */

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

/* export interface BackendIndex {
  index_uuid: string;
  name: string;
  status: string;
  vectorized: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  storage: StorageInfo;
} */

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
