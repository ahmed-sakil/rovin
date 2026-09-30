import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { BD_PHONE_REGEX } from '../utils/validators.js';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  phone: z.string().regex(BD_PHONE_REGEX, 'Valid 11-digit BD mobile number required'),
  purpose: z.enum(['ORDER_PROBLEM', 'PRODUCT_INQUIRY', 'WHOLESALE_BUSINESS', 'CUSTOM_BUILD', 'OTHER']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function getSiteContent(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const content = await prisma.siteContent.findUnique({
      where: { slug: String(slug) },
    });

    if (!content) {
      res.status(404).json({ success: false, message: 'Content page not found' });
      return;
    }

    res.status(200).json({ success: true, content });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve page' });
  }
}

export async function updateSiteContent(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    const updated = await prisma.siteContent.upsert({
      where: { slug: String(slug) },
      update: { title, content },
      create: { slug: String(slug), title, content },
    });

    res.status(200).json({ success: true, content: updated, message: 'Content updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
}

export async function getAllSiteContent(req: Request, res: Response): Promise<void> {
  try {
    const pages = await prisma.siteContent.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.status(200).json({ success: true, pages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve content list' });
  }
}

export async function submitContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, email, phone, purpose, message } = parsed.data;

    const record = await prisma.contactMessage.create({
      data: { name, email, phone, purpose, message },
    });

    res.status(201).json({
      success: true,
      message: 'Transmission received. Our command team will review your inquiry shortly.',
      id: record.id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit contact message' });
  }
}

export async function getContactMessages(req: Request, res: Response): Promise<void> {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve contact messages' });
  }
}

export async function updateContactStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id: String(id) },
      data: { status },
    });

    res.status(200).json({ success: true, message: 'Status updated', updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update contact status' });
  }
}
