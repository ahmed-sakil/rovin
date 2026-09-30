import { Request, Response } from 'express';
import { uploadImageBuffer } from '../services/cloudinary.js';

export async function uploadSingleFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file was uploaded.' });
      return;
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Metadata extraction
    const metadata = {
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      sizeFormatted: `${(size / 1024).toFixed(1)} KB`,
    };

    const uploaded = await uploadImageBuffer(buffer, 'rovin/products', originalname);

    res.status(200).json({
      success: true,
      url: uploaded.url,
      metadata: {
        ...metadata,
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
        publicId: uploaded.publicId,
      },
      message: 'File processed and telemetry extracted.',
    });
  } catch (error: any) {
    console.error('[uploadSingleFile Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to upload and process file.' });
  }
}
