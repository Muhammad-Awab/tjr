// app/api/admin/orders/[id]/route.ts - GET, PUT, DELETE specific order

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET single order
async function getOrder(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Format the response to match the expected frontend format
    const formattedOrder = {
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      email: order.user?.email || 'Unknown',
      status: order.status,
      total: order.grandTotal,
      date: order.createdAt.toISOString().split('T')[0]
    }
    
    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PUT update order
async function updateOrder(
  request: Request,
  orderId: number
) {
  try {
    const body = await request.json()
    const { status } = body
    
    // Validate required fields
    if (!status) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
    }
    
    // Validate status enum
    // Define the OrderStatus enum
    enum OrderStatus {
      PENDING = "PENDING",
      PROCESSING = "PROCESSING",
      SHIPPED = "SHIPPED",
      DELIVERED = "DELIVERED",
      CANCELLED = "CANCELLED",
      REFUNDED = "REFUNDED",
      ON_HOLD = "ON_HOLD"
    }
    
    // Use Object.values to get all possible enum values
    const validStatuses = Object.values(OrderStatus)
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })
    
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
      },
      include: { user: true }
    })
    
    // Format the response to match the expected frontend format
    const formattedOrder = {
      id: updatedOrder.id,
      customerName: updatedOrder.user?.name || 'Unknown',
      email: updatedOrder.user?.email || 'Unknown',
      status: updatedOrder.status,
      total: updatedOrder.grandTotal,
      date: updatedOrder.createdAt.toISOString().split('T')[0]
    }
    
    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE order
async function deleteOrder(orderId: number) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    })
    
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Delete order
    await prisma.order.delete({
      where: { id: orderId },
    })
    
    return new NextResponse(null, { status: 204 }) // No content response for successful deletion
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  
  // Validate id parameter
  if (!id) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }
  
  const orderId = parseInt(id, 10)
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Order ID must be a number' }, { status: 400 })
  }
  
  return await getOrder(orderId)
}

export async function PUT(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  if (!id) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }
  
  const orderId = parseInt(id, 10)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Order ID must be a number' }, { status: 400 })
  }
  
  return await updateOrder(request, orderId)
}

export async function DELETE(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const id = (await params).id

  if (!id) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }
  
  const orderId = parseInt(id, 10)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Order ID must be a number' }, { status: 400 })
  }
  
  return await deleteOrder(orderId)
}