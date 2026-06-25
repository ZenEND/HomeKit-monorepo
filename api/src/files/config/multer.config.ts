import { join, extname } from 'path';
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from "fs";
import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = join(process.cwd(), 'uploads');

const allowedMimeTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
]

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR, { recursive: true });
      }

        callback(null, UPLOAD_DIR);
    },

    filename: (_req, file, callback) => {
      const fileExt = extname(file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;

      callback(null, fileName);
    },
  }),

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Invalid file type',
        ),
        false
      )
    }

    callback(null, true);
  },

  limits: {
    fileSize: 1024 * 1024 * 1024,
  }
}
