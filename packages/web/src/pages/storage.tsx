import { useEffect, useState } from 'react';
import {
  Grid01,
  List,
  Plus,
  SearchLg,
  Trash01,
  UploadCloud02,
} from '@untitledui/icons';
import { FileIcon } from '@untitledui/file-icons';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { MediaUploadDropdown } from '@/components/files/media-upload-dropdown';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useDebounce } from '@/hooks/use-debounce';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { FileItem, FileTypeFilter } from '@/lib/files/types';
import { useFilesStore } from '@/store/useFilesStore';
import { formatFileSize } from '@/utils/format-file-size';
import { getFileIconType } from '@/utils/get-file-icon-type';
import { cx } from '@/utils/cx';

function FileCard({
  file,
  viewMode,
  onDelete,
}: {
  file: FileItem;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isImage = file.mimeType.startsWith('image/');

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-secondary bg-primary px-4 py-3 transition duration-100 ease-linear hover:bg-primary_hover">
        {isImage && file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="size-10 rounded-lg object-cover"
          />
        ) : (
          <FileIcon type={getFileIconType(file.mimeType, file.name)} size={40} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary">{file.name}</p>
          <p className="text-xs text-tertiary">
            {formatFileSize(file.size)} · {new Date(file.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          color="tertiary"
          size="sm"
          iconLeading={Trash01}
          aria-label={t('storage.deleteFile', { name: file.name })}
          onClick={() => onDelete(file.id)}
        />
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary transition duration-100 ease-linear hover:shadow-xs">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-secondary_subtle">
        {isImage && file.previewUrl ? (
          <img src={file.previewUrl} alt={file.name} className="size-full object-cover" />
        ) : (
          <FileIcon type={getFileIconType(file.mimeType, file.name)} size={48} />
        )}
        <Button
          color="secondary"
          size="sm"
          iconLeading={Trash01}
          aria-label={t('storage.deleteFile', { name: file.name })}
          className="absolute top-2 right-2 opacity-0 transition duration-100 ease-linear group-hover:opacity-100"
          onClick={() => onDelete(file.id)}
        />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-primary">{file.name}</p>
        <p className="mt-0.5 text-xs text-tertiary">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}

export function Storage() {
  const { t } = useTranslation();
  const {
    folders,
    files,
    currentFolderId,
    filter,
    viewMode,
    isLoading,
    error,
    fetchFolders,
    fetchFiles,
    setCurrentFolder,
    setSearch,
    setTypeFilter,
    setViewMode,
    createFolder,
    uploadFile,
    deleteFile,
  } = useFilesStore();

  const [searchInput, setSearchInput] = useState(filter.search);
  const [newFolderName, setNewFolderName] = useState('');
  const debouncedSearch = useDebounce(searchInput);
  const typeFilterOptions = [
    { id: 'all', label: t('storage.allTypes') },
    { id: 'images', label: t('storage.images') },
    { id: 'documents', label: t('storage.documents') },
    { id: 'videos', label: t('storage.videos') },
    { id: 'other', label: t('storage.other') },
  ];

  useEffect(() => {
    void fetchFolders();
    void fetchFiles();
  }, [fetchFolders, fetchFiles]);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    await createFolder(name);
    setNewFolderName('');
  };

  const handleDelete = (fileId: string) => {
    void deleteFile(fileId);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">{t('storage.title')}</h1>
          <p className="mt-1 text-md text-tertiary">{t('storage.subtitle')}</p>
        </div>
        <MediaUploadDropdown
          label={t('storage.upload')}
          isLoading={isLoading}
          onUpload={uploadFile}
        />
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-secondary bg-primary p-4">
            <p className="mb-3 text-xs font-semibold tracking-wide text-quaternary uppercase">
              {t('storage.folders')}
            </p>
            <ul className="flex flex-col gap-1">
              {folders.map((folder) => (
                <li key={folder.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(folder.id)}
                    className={cx(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-100 ease-linear',
                      currentFolderId === folder.id
                        ? 'bg-active text-primary'
                        : 'text-secondary hover:bg-primary_hover hover:text-primary',
                    )}
                  >
                    <FileIcon type="folder" size={20} />
                    {folder.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2 border-t border-secondary pt-4">
              <Input
                size="sm"
                placeholder={t('storage.newFolder')}
                value={newFolderName}
                onChange={setNewFolderName}
                aria-label={t('storage.newFolderName')}
              />
              <Button
                size="sm"
                iconLeading={Plus}
                aria-label={t('storage.createFolder')}
                onClick={() => void handleCreateFolder()}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              className="flex-1"
              icon={SearchLg}
              placeholder={t('storage.search')}
              value={searchInput}
              onChange={setSearchInput}
              aria-label={t('storage.searchLabel')}
            />

            <Select
              className="sm:w-44"
              placeholder={t('storage.filterType')}
              selectedKey={filter.type}
              onSelectionChange={(key) => {
                if (typeof key === 'string') {
                  setTypeFilter(key as FileTypeFilter);
                }
              }}
              items={typeFilterOptions}
            >
              {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>

            <ButtonGroup
              selectedKeys={[viewMode]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected === 'grid' || selected === 'list') {
                  setViewMode(selected);
                }
              }}
            >
              <ButtonGroupItem id="grid" iconLeading={Grid01} aria-label={t('storage.gridView')} />
              <ButtonGroupItem id="list" iconLeading={List} aria-label={t('storage.listView')} />
            </ButtonGroup>
          </div>

          {error && (
            <p className="mb-4 text-sm text-error-primary" role="alert">
              {error}
            </p>
          )}

          {isLoading && files.length === 0 ? (
            <div className="flex justify-center py-16">
              <LoadingIndicator type="line-spinner" size="lg" label={t('storage.loading')} />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-secondary bg-primary py-16 text-center">
              <FeaturedIcon icon={UploadCloud02} color="gray" theme="modern" size="xl" />
              <h2 className="mt-4 text-lg font-semibold text-primary">{t('storage.emptyTitle')}</h2>
              <p className="mt-2 max-w-sm text-sm text-tertiary">{t('storage.emptyDescription')}</p>
            </div>
          ) : (
            <div
              className={cx(
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-2',
              )}
            >
              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
