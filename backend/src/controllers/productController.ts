import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const ProductSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().min(5, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional().nullable(),
  priceBDT: z.number().positive('Price must be greater than 0'),
  costPriceBDT: z.number().optional().nullable(),
  discountPriceBDT: z.number().optional().nullable(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  availableColors: z.any().optional(),     // [{ name, hex }]
  availableSizes: z.any().optional(),      // ["1:16", "1:12"]
  weightGrams: z.number().optional().nullable(),
  packageIncludes: z.any().optional(),     // ["1x RC Car", ...]
  specs: z.any().optional(),               // { scale, motor, battery, speed }
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      categoryId,
      subcategoryId,
      minPrice,
      maxPrice,
      inStock,
      sort = 'newest',
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = {};

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = String(categoryId);
    }

    if (subcategoryId) {
      where.subcategoryId = String(subcategoryId);
    }

    if (minPrice || maxPrice) {
      where.priceBDT = {};
      if (minPrice) where.priceBDT.gte = Number(minPrice);
      if (maxPrice) where.priceBDT.lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    } else if (inStock === 'false') {
      where.stockQuantity = { lte: 0 };
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { priceBDT: 'asc' };
    if (sort === 'price_desc') orderBy = { priceBDT: 'desc' };
    if (sort === 'stock_desc') orderBy = { stockQuantity: 'desc' };
    if (sort === 'stock_asc') orderBy = { stockQuantity: 'asc' };

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total: totalCount,
        page: Number(page) || 1,
        limit: take,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (error: any) {
    console.error('[getProducts Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

export async function getProductByIdOrSlug(req: Request, res: Response): Promise<void> {
  try {
    const target = String(req.params.idOrSlug);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: target }, { slug: target }],
      },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, profileImageUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error: any) {
    console.error('[getProductByIdOrSlug Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const {
      title,
      slug,
      sku,
      description,
      categoryId,
      subcategoryId,
      priceBDT,
      costPriceBDT,
      discountPriceBDT,
      stockQuantity,
      lowStockThreshold,
      availableColors,
      availableSizes,
      weightGrams,
      packageIncludes,
      specs,
      images,
      isActive,
      featured,
    } = parsed.data;

    // Check duplicate SKU or Slug
    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug }] },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: existing.sku === sku
          ? `SKU '${sku}' already registered in warehouse ledger.`
          : `Slug '${slug}' already exists.`,
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        sku,
        description,
        categoryId,
        subcategoryId: subcategoryId || null,
        priceBDT,
        costPriceBDT: costPriceBDT || null,
        discountPriceBDT: discountPriceBDT || null,
        stockQuantity,
        lowStockThreshold,
        availableColors: availableColors || undefined,
        availableSizes: availableSizes || undefined,
        weightGrams: weightGrams || null,
        packageIncludes: packageIncludes || undefined,
        specs: specs || undefined,
        images,
        isActive,
        featured,
      },
      include: {
        category: true,
        subcategory: true,
      },
    });

    res.status(201).json({
      success: true,
      product,
      message: `Product '${product.title}' calibrated and stocked into inventory.`,
    });
  } catch (error: any) {
    console.error('[createProduct Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to catalog.' });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = ProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const updated = await prisma.product.update({
      where: { id: String(id) },
      data: parsed.data as any,
      include: {
        category: true,
        subcategory: true,
      },
    });

    res.status(200).json({
      success: true,
      product: updated,
      message: `Product '${updated.title}' specifications updated.`,
    });
  } catch (error: any) {
    console.error('[updateProduct Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: String(id) },
    });
    res.status(200).json({ success: true, message: 'Product decommissioned from catalog.' });
  } catch (error: any) {
    console.error('[deleteProduct Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product.' });
  }
}

/**
 * Quick Stock Telemetry Adjustment (+/- delta or set exact count)
 */
export async function adjustStock(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { delta, exactQuantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: String(id) } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let newQuantity = product.stockQuantity;
    if (typeof exactQuantity === 'number') {
      newQuantity = Math.max(0, exactQuantity);
    } else if (typeof delta === 'number') {
      newQuantity = Math.max(0, product.stockQuantity + delta);
    }

    const updated = await prisma.product.update({
      where: { id: String(id) },
      data: { stockQuantity: newQuantity },
      select: {
        id: true,
        title: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
    });

    res.status(200).json({
      success: true,
      product: updated,
      message: `Stock recalibrated to ${newQuantity} units.`,
    });
  } catch (error: any) {
    console.error('[adjustStock Error]:', error);
    res.status(500).json({ success: false, message: 'Stock adjustment failed.' });
  }
}
