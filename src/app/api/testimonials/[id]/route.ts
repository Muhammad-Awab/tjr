// app/api/testimonials/[id]/route.ts
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/testimonials/[id] - Get testimonial by ID
export async function GET( request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const testimonialId = Number(id);

  if (isNaN(testimonialId)) {
    return NextResponse.json({ message: 'Invalid testimonial ID' }, { status: 400 });
  }
  
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });

    if (!testimonial) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    // Return formatted testimonial to match component interface
    return NextResponse.json({
      id: testimonial.id,
      name: testimonial.name,
      testimonial: testimonial.content,
      rating: testimonial.rating,
      videoUrl: testimonial.url,
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json({ message: 'Failed to fetch testimonial' }, { status: 500 });
  }
}
// PUT /api/testimonials/[id] - Update testimonial
export async function PUT( request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const testimonialId = Number(id);

  if (isNaN(testimonialId)) {
    return NextResponse.json({ message: 'Invalid testimonial ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, testimonial, rating, videoUrl } = body;

    // Validate input
    if (!name || !testimonial) {
      return NextResponse.json({ message: 'Name and testimonial content are required' }, { status: 400 });
    }

    // Check if testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    // Update testimonial
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: {
        name,
        content: testimonial,
        rating: Number(rating) || 5,
        url: videoUrl || '',
        updatedAt: new Date(),
      },
    });

    // Return formatted testimonial to match component interface
    return NextResponse.json({
      id: updatedTestimonial.id,
      name: updatedTestimonial.name,
      testimonial: updatedTestimonial.content,
      rating: updatedTestimonial.rating,
      videoUrl: updatedTestimonial.url,
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ message: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id] - Delete testimonial
export async function DELETE( request: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const testimonialId = parseInt(id);

  if (isNaN(testimonialId)) {
    return NextResponse.json({ message: 'Invalid testimonial ID' }, { status: 400 });
  }
  
  try {
    // Check if testimonial exists
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
    });

    if (!testimonial) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    // Delete testimonial
    await prisma.testimonial.delete({
      where: { id: testimonialId },
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ message: 'Failed to delete testimonial' }, { status: 500 });
  }
}