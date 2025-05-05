import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET with pagination
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 100; // Max 100 items per page
    const skip = (page - 1) * limit;

    try {
        const [products, total] = await Promise.all([
            prisma.inventory.findMany({
                skip,
                take: limit,
                orderBy: { id: 'asc' }
            }),
            prisma.inventory.count()
        ]);

        const data = products.map(product => ({
            id: product.id,
            name: product.handle,
            price: product.variantPrice,
            stock: product.quantity || 0,
            category: product.type || "Uncategorized",
            image: product.imageSrc || "/placeholder.svg"
        }));

        return NextResponse.json({
            data,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const product = await prisma.inventory.create({
            data: {
                handle: body.name,
                variantPrice: body.price,
                quantity: body.stock || 0,
                type: body.category,
                imageSrc: body.image || "/placeholder.svg"
            }
        });
        
        return NextResponse.json({
            id: product.id,
            name: product.handle,
            price: product.variantPrice,
            stock: product.quantity || 0,
            category: product.type || "Uncategorized",
            image: product.imageSrc || "/placeholder.svg"
        }, { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
