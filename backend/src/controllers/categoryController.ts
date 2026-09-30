import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const CategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const SubcategorySchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().min(2, 'Subcategory name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    console.error('[getCategories Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, slug, description, imageUrl, isActive } = parsed.data;

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'A category with this name or slug already exists.' });
      return;
    }

    const category = await prisma.category.create({
      data: { name, slug, description, imageUrl, isActive },
      include: { subcategories: true },
    });

    res.status(201).json({ success: true, category, message: 'Category added to database.' });
  } catch (error: any) {
    console.error('[createCategory Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = CategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const category = await prisma.category.update({
      where: { id: String(id) },
      data: parsed.data,
      include: { subcategories: true },
    });

    res.status(200).json({ success: true, category, message: 'Category updated.' });
  } catch (error: any) {
    console.error('[updateCategory Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: String(id) },
    });
    res.status(200).json({ success: true, message: 'Category removed.' });
  } catch (error: any) {
    console.error('[deleteCategory Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to remove category.' });
  }
}

export async function createSubcategory(req: Request, res: Response): Promise<void> {
  try {
    const parsed = SubcategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { categoryId, name, slug, description, isActive } = parsed.data;

    const sub = await prisma.subcategory.create({
      data: { categoryId, name, slug, description, isActive },
    });

    res.status(201).json({ success: true, subcategory: sub, message: 'Subcategory added.' });
  } catch (error: any) {
    console.error('[createSubcategory Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create subcategory.' });
  }
}

export async function deleteSubcategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.subcategory.delete({
      where: { id: String(id) },
    });
    res.status(200).json({ success: true, message: 'Subcategory removed.' });
  } catch (error: any) {
    console.error('[deleteSubcategory Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to remove subcategory.' });
  }
}
