// app/api/orders/route.ts - GET all orders

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Define the Order type to match your frontend


// Initialize Prisma client
const prisma = new PrismaClient()

// GET handler for App Router
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, // Latest orders first
    })
    
    // Format the orders to match the expected frontend format
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: `Customer ${order.orderNumber}`, // Use orderNumber since customerName doesn't exist
      email: `customer-${order.id}@example.com`, // Placeholder email
      status: order.status,
      total: order.totalAmount?.toString() || order.grandTotal.toString(), // Use actual properties from schema
      date: order.createdAt.toISOString().split('T')[0]
    }))
    
    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}