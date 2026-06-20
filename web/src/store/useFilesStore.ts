import { create } from 'zustand';
import type { FilesApi } from '@/lib/files/files-api';
import { mockFilesApi } from '@/lib/files/mock-files-api';
import type {
  FileFilter,
  FileItem,
  FileTypeFilter,
  FolderItem,
  ViewMode,
} from '@/lib/files/types';

type FilesState = {
  folders: FolderItem[];
  files: FileItem[];
  currentFolderId: string;
  filter: FileFilter;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  fetchFiles: () => Promise<void>;
  setCurrentFolder: (folderId: string) => void;
  setSearch: (search: string) => void;
  setTypeFilter: (type: FileTypeFilter) => void;
  setViewMode: (mode: ViewMode) => void;
  createFolder: (name: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
};

const defaultFolderId = 'folder-photos';

function createFilesStore(api: FilesApi) {
  return create<FilesState>((set, get) => ({
    folders: [],
    files: [],
    currentFolderId: defaultFolderId,
    filter: { search: '', type: 'all' },
    viewMode: 'grid',
    isLoading: false,
    error: null,

    fetchFolders: async () => {
      try {
        const folders = await api.listFolders();
        set({ folders, error: null });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load folders',
        });
      }
    },

    fetchFiles: async () => {
      const { currentFolderId, filter } = get();
      set({ isLoading: true, error: null });

      try {
        const files = await api.listFiles(currentFolderId, filter);
        set({ files, isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load files',
        });
      }
    },

    setCurrentFolder: (folderId) => {
      set({ currentFolderId: folderId });
      void get().fetchFiles();
    },

    setSearch: (search) => {
      set((state) => ({ filter: { ...state.filter, search } }));
      void get().fetchFiles();
    },

    setTypeFilter: (type) => {
      set((state) => ({ filter: { ...state.filter, type } }));
      void get().fetchFiles();
    },

    setViewMode: (viewMode) => set({ viewMode }),

    createFolder: async (name) => {
      set({ isLoading: true, error: null });
      try {
        await api.createFolder({ name, parentId: null });
        await get().fetchFolders();
        set({ isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create folder',
        });
      }
    },

    uploadFile: async (file) => {
      const { currentFolderId } = get();
      set({ isLoading: true, error: null });
      try {
        await api.uploadFile({ file, folderId: currentFolderId });
        await get().fetchFiles();
        set({ isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to upload file',
        });
      }
    },

    deleteFile: async (fileId) => {
      set({ isLoading: true, error: null });
      try {
        await api.deleteFile(fileId);
        await get().fetchFiles();
        set({ isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete file',
        });
      }
    },
  }));
}

export const useFilesStore = createFilesStore(mockFilesApi);
