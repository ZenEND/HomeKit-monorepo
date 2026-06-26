import { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Image01 as ImagePlus, Trash01, X } from '@untitledui/icons';
import { uploadCardImage } from '@/api/cards';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

const CARD_ASPECT = 2 / 3;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

function getCroppedImageDataUrl(
  image: HTMLImageElement,
  crop: Crop,
): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelCrop = {
    x: (crop.x / 100) * image.width * scaleX,
    y: (crop.y / 100) * image.height * scaleY,
    width: (crop.width / 100) * image.width * scaleX,
    height: (crop.height / 100) * image.height * scaleY,
  };

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setRawSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, CARD_ASPECT));
  }, []);

  const handleCropSave = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsUploading(true);

    try {
      const dataUrl = getCroppedImageDataUrl(imgRef.current, completedCrop);

      // Convert data URL to Blob and upload
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'card-image.jpg', { type: 'image/jpeg' });
      const { imageUrl } = await uploadCardImage(file);
      onChange(imageUrl);
    } catch {
      // On error, store the data URL as a local preview (no server)
      const dataUrl = getCroppedImageDataUrl(imgRef.current, completedCrop);
      onChange(dataUrl);
    } finally {
      setRawSrc(null);
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setRawSrc(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Crop modal */}
      {rawSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-secondary/60 bg-primary p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Crop Image</h3>
              <button
                onClick={() => setRawSrc(null)}
                className="rounded-lg p-1.5 text-tertiary hover:bg-secondary/40 hover:text-primary transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-tertiary">
              Drag and pan inside the crop area. Fixed 2:3 card ratio.
            </p>
            <div className="max-h-[50vh] overflow-auto rounded-xl border border-secondary/60">
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={(_, pct) => setCompletedCrop(pct)}
                aspect={CARD_ASPECT}
                minWidth={30}
              >
                <img
                  ref={imgRef}
                  src={rawSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRawSrc(null)}
                className="rounded-lg border border-secondary/60 px-4 py-2 text-sm text-tertiary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleCropSave()}
                disabled={isUploading || !completedCrop}
                className="rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white hover:bg-brand-solid_hover transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Saving…' : 'Crop & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload area */}
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-secondary/60" style={{ aspectRatio: '2/3', maxWidth: 120 }}>
          <img src={value} alt="Card" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
          >
            <Trash01 className="size-3" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary/60 bg-primary/20 py-8 transition-colors hover:border-brand-primary hover:bg-brand-primary/5">
          <ImagePlus className="size-6 text-quaternary" />
          <div className="text-center">
            <p className="text-sm font-medium text-secondary">Upload card image</p>
            <p className="text-xs text-quaternary">JPG, PNG, WebP — max 5 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
