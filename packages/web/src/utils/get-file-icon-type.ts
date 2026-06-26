const extensionMap: Record<string, string> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'docx',
  xls: 'xls',
  xlsx: 'xlsx',
  ppt: 'ppt',
  pptx: 'pptx',
  txt: 'txt',
  csv: 'csv',
  jpg: 'jpg',
  jpeg: 'jpeg',
  png: 'png',
  gif: 'gif',
  webp: 'webp',
  svg: 'svg',
  mp4: 'mp4',
  mov: 'video',
  avi: 'avi',
  mkv: 'mkv',
  mp3: 'mp3',
  wav: 'wav',
  zip: 'zip',
  json: 'json',
  js: 'js',
  html: 'html',
  css: 'css',
};

function mimeCategory(mimeType: string): string {
  const [category] = mimeType.split('/');
  if (category === 'image') return 'image';
  if (category === 'video') return 'video';
  if (category === 'audio') return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) {
    return 'document';
  }
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) {
    return 'code';
  }
  return 'unknown';
}

export function getFileIconType(mimeType: string, fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension && extensionMap[extension]) {
    return extensionMap[extension];
  }

  const category = mimeCategory(mimeType);

  switch (category) {
    case 'image':
      return 'image';
    case 'document':
      return 'document';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'code':
      return 'code';
    default:
      return 'empty';
  }
}
