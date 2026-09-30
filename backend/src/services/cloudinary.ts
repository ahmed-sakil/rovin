import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = 'rovin/products',
  originalFilename = 'upload.jpg'
): Promise<UploadResult> {
  const isCloudinaryConfigured =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp',
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned null'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local fallback: Save to frontend/public/uploads
  const uploadDir = path.resolve(process.cwd(), '../frontend/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const cleanExt = path.extname(originalFilename) || '.webp';
  const fileName = `rovin-${uniqueSuffix}${cleanExt}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${fileName}`,
    bytes: buffer.length,
    format: cleanExt.replace('.', ''),
  };
}
