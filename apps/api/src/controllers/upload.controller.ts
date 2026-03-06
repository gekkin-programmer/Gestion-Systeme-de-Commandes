import path from 'path';
import fs from 'fs';
import multer from 'multer';
import type { Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';

const UPLOAD_DIR = path.resolve(process.cwd(), '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

export const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

export async function uploadImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  // Try Cloudinary if credentials are configured
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'restaurant-menu',
        transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
      });
      fs.unlinkSync(file.path);
      res.json({ success: true, data: { url: result.secure_url } });
      return;
    } catch {
      // fall through to local
    }
  }

  // Local fallback — served via express.static at /api/v1/uploads
  res.json({ success: true, data: { url: `/api/v1/uploads/${file.filename}` } });
}
