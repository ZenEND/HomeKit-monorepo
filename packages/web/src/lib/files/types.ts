export type FileTypeFilter = 'all' | 'images' | 'documents' | 'videos' | 'other';

export type ViewMode = 'grid' | 'list';

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileFilter {
  search: string;
  type: FileTypeFilter;
}

export interface UploadPayload {
  file: File;
  folderId: string;
}

export interface CreateFolderPayload {
  name: string;
  parentId: string | null;
}
