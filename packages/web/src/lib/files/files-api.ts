import type {
  CreateFolderPayload,
  FileFilter,
  FileItem,
  FolderItem,
  UploadPayload,
} from './types';

export interface FilesApi {
  listFolders(): Promise<FolderItem[]>;
  listFiles(folderId: string, filter?: FileFilter): Promise<FileItem[]>;
  createFolder(payload: CreateFolderPayload): Promise<FolderItem>;
  uploadFile(payload: UploadPayload): Promise<FileItem>;
  deleteFile(fileId: string): Promise<void>;
  moveFile(fileId: string, folderId: string): Promise<FileItem>;
}
