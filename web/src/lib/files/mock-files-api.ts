import type { FilesApi } from './files-api';
import type {
  CreateFolderPayload,
  FileFilter,
  FileItem,
  FileTypeFilter,
  FolderItem,
  UploadPayload,
} from './types';

const now = () => new Date().toISOString();

let folders: FolderItem[] = [
  { id: 'folder-photos', name: 'Photos', parentId: null, createdAt: now() },
  { id: 'folder-documents', name: 'Documents', parentId: null, createdAt: now() },
  { id: 'folder-videos', name: 'Videos', parentId: null, createdAt: now() },
];

let files: FileItem[] = [
  {
    id: 'file-1',
    name: 'living-room.jpg',
    folderId: 'folder-photos',
    mimeType: 'image/jpeg',
    size: 2_450_000,
    previewUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'file-2',
    name: 'kitchen.png',
    folderId: 'folder-photos',
    mimeType: 'image/png',
    size: 1_820_000,
    previewUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'file-3',
    name: 'home-manual.pdf',
    folderId: 'folder-documents',
    mimeType: 'application/pdf',
    size: 540_000,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'file-4',
    name: 'inventory.xlsx',
    folderId: 'folder-documents',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 128_000,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'file-5',
    name: 'security-cam.mp4',
    folderId: 'folder-videos',
    mimeType: 'video/mp4',
    size: 12_400_000,
    createdAt: now(),
    updatedAt: now(),
  },
];

function matchesTypeFilter(mimeType: string, type: FileTypeFilter): boolean {
  if (type === 'all') return true;

  const category = mimeType.split('/')[0];

  switch (type) {
    case 'images':
      return category === 'image';
    case 'documents':
      return (
        mimeType.includes('pdf') ||
        mimeType.includes('document') ||
        mimeType.includes('sheet') ||
        mimeType.includes('text')
      );
    case 'videos':
      return category === 'video';
    case 'other':
      return category !== 'image' && category !== 'video' && !mimeType.includes('pdf') && !mimeType.includes('document');
    default:
      return true;
  }
}

function filterFiles(items: FileItem[], folderId: string, filter?: FileFilter): FileItem[] {
  return items.filter((file) => {
    if (file.folderId !== folderId) return false;
    if (filter?.search && !file.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter?.type && !matchesTypeFilter(file.mimeType, filter.type)) {
      return false;
    }
    return true;
  });
}

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockFilesApi: FilesApi = {
  async listFolders() {
    await delay();
    return [...folders];
  },

  async listFiles(folderId, filter) {
    await delay();
    return filterFiles(files, folderId, filter);
  },

  async createFolder(payload: CreateFolderPayload) {
    await delay();
    const folder: FolderItem = {
      id: `folder-${crypto.randomUUID()}`,
      name: payload.name,
      parentId: payload.parentId,
      createdAt: now(),
    };
    folders = [...folders, folder];
    return folder;
  },

  async uploadFile(payload: UploadPayload) {
    await delay(600);
    const previewUrl = payload.file.type.startsWith('image/')
      ? URL.createObjectURL(payload.file)
      : undefined;

    const file: FileItem = {
      id: `file-${crypto.randomUUID()}`,
      name: payload.file.name,
      folderId: payload.folderId,
      mimeType: payload.file.type || 'application/octet-stream',
      size: payload.file.size,
      previewUrl,
      createdAt: now(),
      updatedAt: now(),
    };

    files = [file, ...files];
    return file;
  },

  async deleteFile(fileId: string) {
    await delay();
    const target = files.find((f) => f.id === fileId);
    if (target?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }
    files = files.filter((f) => f.id !== fileId);
  },

  async moveFile(fileId: string, folderId: string) {
    await delay();
    files = files.map((file) =>
      file.id === fileId ? { ...file, folderId, updatedAt: now() } : file,
    );
    const moved = files.find((f) => f.id === fileId);
    if (!moved) throw new Error('File not found');
    return moved;
  },
};
