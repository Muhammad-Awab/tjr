// pages/api/admin/orders.ts - POST new order (admin route)

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, email, status, total, userId } = body;
    
    // Validate required fields
    if (!customerName || !email || !status || !total || !userId) {
      console.error('Missing required fields:', { customerName, email, status, total, userId });
      return NextResponse.json({ error: 'Missing required order fields including userId' }, { status: 400 });
    }
    
    // Validate total is a valid number
    const totalAmount = parseFloat(total);
    if (isNaN(totalAmount)) {
      
      return NextResponse.json({ error: 'Total must be a valid number' }, { status: 400 });
    }
    
    const order = await prisma.order.create({
      data: {
        // Map fields to the actual schema
        orderNumber: `ORD-${Date.now()}`, // Generate an order number
        totalAmount: totalAmount,
        status,
        // Use the userId provided in the request
        userId: parseInt(userId),
        shippingCost: 0,
        taxAmount: 0,
        discountAmount: 0,
        grandTotal: totalAmount, // Using the total as grandTotal
        shippingAddressId: 1, // Default shipping address ID, adjust as needed
      }
    });

    // Format the response to match the expected frontend format
    const formattedOrder = {
      id: order.id,
      customerName, // Use the input value since it's not in the order object
      email, // Use the input value since it's not in the order object
      status: order.status,
      total: order.totalAmount, // Use the appropriate field from the order
      date: order.createdAt.toISOString().split('T')[0]
    };
    
    return NextResponse.json(formattedOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}