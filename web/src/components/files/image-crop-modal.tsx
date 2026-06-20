import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';
import { getCroppedImageFile } from '@/utils/crop-image';

type AspectOption = 'free' | '1:1' | '16:9';

const aspectMap: Record<AspectOption, number | undefined> = {
  free: undefined,
  '1:1': 1,
  '16:9': 16 / 9,
};

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName: string;
  mimeType: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  fileName,
  mimeType,
  onClose,
  onConfirm,
}: ImageCropModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<AspectOption>('free');
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;

    setIsSaving(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedArea, fileName, mimeType);
      onConfirm(file);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={({ isEntering, isExiting }) =>
        cx(
          'fixed inset-0 z-50 flex items-center justify-center bg-overlay/70 p-4',
          isEntering && 'duration-200 ease-out animate-in fade-in',
          isExiting && 'duration-150 ease-in animate-out fade-out',
        )
      }
    >
      <AriaModal
        className={({ isEntering, isExiting }) =>
          cx(
            'w-full max-w-lg overflow-hidden rounded-2xl border border-secondary bg-primary shadow-xl outline-hidden',
            isEntering && 'duration-200 ease-out animate-in zoom-in-95',
            isExiting && 'duration-150 ease-in animate-out zoom-out-95',
          )
        }
      >
        <AriaDialog className="flex flex-col outline-hidden">
          <div className="border-b border-secondary px-6 py-4">
            <h2 className="text-lg font-semibold text-primary">{t('crop.title')}</h2>
            <p className="mt-1 text-sm text-tertiary">{t('crop.description')}</p>
          </div>

          <div className="relative h-72 bg-secondary">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectMap[aspect]}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex flex-col gap-4 border-b border-secondary px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary">{t('crop.zoom')}</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-brand-600"
              />
            </div>

            <ButtonGroup
              selectedKeys={[aspect]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected === 'free' || selected === '1:1' || selected === '16:9') {
                  setAspect(selected);
                }
              }}
            >
              <ButtonGroupItem id="free">{t('crop.free')}</ButtonGroupItem>
              <ButtonGroupItem id="1:1">1:1</ButtonGroupItem>
              <ButtonGroupItem id="16:9">16:9</ButtonGroupItem>
            </ButtonGroup>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4">
            <Button color="secondary" onClick={onClose}>
              {t('crop.cancel')}
            </Button>
            <Button isLoading={isSaving} onClick={() => void handleConfirm()}>
              {t('crop.upload')}
            </Button>
          </div>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}
