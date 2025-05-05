// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET handler
export async function GET(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id)
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT handler
export async function PUT(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
const userId = parseInt(id)
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const { name, email, role } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    
    // Handle case where user doesn't exist
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE handler

export async function DELETE(
  request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { orders: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Handle the foreign key constraint by deleting related orders first
    if (user.orders && user.orders.length > 0) {
      await prisma.order.deleteMany({
        where: { userId: userId }
      });
    }

    // Now delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle specific Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      // P2025: Record not found
      if (error.code === 'P2025') {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      // P2003: Foreign key constraint failed
      if (error.code === 'P2003') {
        return NextResponse.json(
          { 
            message: 'Cannot delete user because they have related data', 
            details: 'The user has associated orders or other data that must be deleted first'
          }, 
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}