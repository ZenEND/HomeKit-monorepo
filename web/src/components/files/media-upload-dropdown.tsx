import { useCallback, useRef, useState } from 'react';
import { ChevronDown, UploadCloud02 } from '@untitledui/icons';
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { ImageCropModal } from '@/components/files/image-crop-modal';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

interface PendingImage {
  src: string;
  fileName: string;
  mimeType: string;
}

interface MediaUploadDropdownProps {
  onUpload: (file: File) => void | Promise<void>;
  isLoading?: boolean;
  label?: string;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function MediaUploadDropdown({
  onUpload,
  isLoading = false,
  label = 'Upload',
}: MediaUploadDropdownProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const processFile = useCallback((file: File) => {
    if (isImageFile(file)) {
      const src = URL.createObjectURL(file);
      setPendingImage({ src, fileName: file.name, mimeType: file.type });
      setIsOpen(false);
      return;
    }

    void onUpload(file);
    setIsOpen(false);
  }, [onUpload]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
          return;
        }
      }
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleCropConfirm = async (file: File) => {
    if (pendingImage?.src.startsWith('blob:')) {
      URL.revokeObjectURL(pendingImage.src);
    }
    setPendingImage(null);
    await onUpload(file);
  };

  const handleCropClose = () => {
    if (pendingImage?.src.startsWith('blob:')) {
      URL.revokeObjectURL(pendingImage.src);
    }
    setPendingImage(null);
  };

  return (
    <>
      <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button iconLeading={UploadCloud02} iconTrailing={ChevronDown} isLoading={isLoading}>
          {label}
        </Button>

        <AriaPopover
          placement="bottom end"
          offset={8}
          className={({ isEntering, isExiting }) =>
            cx(
              'z-50 w-80 rounded-xl border border-secondary bg-primary p-4 shadow-lg outline-hidden',
              isEntering && 'duration-150 ease-out animate-in fade-in slide-in-from-top-1',
              isExiting && 'duration-100 ease-in animate-out fade-out slide-out-to-top-1',
            )
          }
        >
          <AriaDialog className="outline-hidden">
            <div
              tabIndex={0}
              role="button"
              onPaste={handlePaste}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className={cx(
                'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition duration-100 ease-linear',
                isDragOver
                  ? 'border-brand bg-brand-secondary'
                  : 'border-secondary bg-secondary_subtle hover:border-brand hover:bg-secondary',
              )}
            >
              <UploadCloud02 className="size-8 text-fg-brand-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-primary">
                  {t('upload.drop')}
                </p>
                <p className="mt-1 text-xs text-tertiary">
                  {t('upload.paste')}
                </p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.mp3,.zip"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </AriaDialog>
        </AriaPopover>
      </AriaDialogTrigger>

      {pendingImage && (
        <ImageCropModal
          isOpen
          imageSrc={pendingImage.src}
          fileName={pendingImage.fileName}
          mimeType={pendingImage.mimeType}
          onClose={handleCropClose}
          onConfirm={(file) => void handleCropConfirm(file)}
        />
      )}
    </>
  );
}
