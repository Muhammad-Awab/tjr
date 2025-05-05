import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Handles GET, PUT and DELETE requests for individual products by slug/id
export async function GET(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId)) {
    return NextResponse.json(
      { error: "Invalid product ID" }, 
      { status: 400 }
    );
  }

  try {
    const product = await prisma.inventory.findUnique({
      where: { id : parsedId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: product.id,
      name: product.handle,
      price: product.variantPrice,
      stock: product.quantity || 0,
      category: product.type || "Uncategorized",
      image: product.imageSrc || "/placeholder.svg"
    });
  } catch (error) {
    console.error(`Failed to fetch product with ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" }, 
      { status: 500 }
    );
  }
}

// Update an existing product
export async function PUT(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId)) {
  
    return NextResponse.json(
      { error: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    // Check if product exists
    const existingProduct = await prisma.inventory.findUnique({
      where: { id: parsedId }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Update the product
    const updatedProduct = await prisma.inventory.update({
      where: { id: parsedId },
      data: {
        handle: body.name,
        variantPrice: body.price,
        quantity: body.stock || 0,
        type: body.category,
        imageSrc: body.image || "/placeholder.svg"
      }
    });
    
    // Return the updated product
    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.handle,
      price: updatedProduct.variantPrice,
      stock: updatedProduct.quantity || 0,
      category: updatedProduct.type || "Uncategorized",
      image: updatedProduct.imageSrc || "/placeholder.svg"
    });
  } catch (error) {
    console.error(`Failed to update product with ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// Delete a product
export async function DELETE(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId)) {
    return NextResponse.json(
      { error: "Invalid product ID" }, 
      { status: 400 }
    );
  }

  try {
    // Check if product exists
    const existingProduct = await prisma.inventory.findUnique({
      where: { id: parsedId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.inventory.delete({
      where: { id: parsedId }
    });

    return NextResponse.json(
      { message: "Product deleted successfully" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error(`Failed to delete product with ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete product" }, 
      { status: 500 }
    );
  }
}