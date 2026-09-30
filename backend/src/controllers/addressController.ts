import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { z } from 'zod';
import { BD_PHONE_REGEX } from '../utils/validators.js';

const AddressSchema = z.object({
  title: z.string().default('Home'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  phoneNumber: z.string().regex(BD_PHONE_REGEX, 'Valid 11-digit BD phone required'),
  district: z.string().min(2, 'District is required'),
  thana: z.string().min(2, 'Thana/Area is required'),
  addressLine: z.string().min(5, 'Detailed delivery address required'),
  isDefault: z.boolean().default(false),
});

export async function getAddresses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.status(200).json({ success: true, addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
}

export async function addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = AddressSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { title, recipientName, phoneNumber, district, thana, addressLine, isDefault } = parsed.data;

    // If marked as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        title,
        recipientName,
        phoneNumber,
        district,
        thana,
        addressLine,
        isDefault,
      },
    });

    res.status(201).json({ success: true, address, message: 'Address saved.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create address.' });
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.address.deleteMany({
      where: { id: String(id), userId: req.user!.id },
    });
    res.status(200).json({ success: true, message: 'Address removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
}
