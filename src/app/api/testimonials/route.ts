// /app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/testimonials - Get all testimonials
export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                role: true,
                content: true,
                rating: true,
                url: true,
            },
        });

        // Map DB field names to match component interface
        const formattedTestimonials = testimonials.map(testimonial => ({
            id: testimonial.id,
            name: testimonial.name,
            role: testimonial.role || '', // Ensure role is included, default to empty string if not present
            testimonial: testimonial.content,
            rating: testimonial.rating,
            videoUrl: testimonial.url,
        }));

        return NextResponse.json(formattedTestimonials, { status: 200 });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ message: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// POST /api/testimonials - Create a new testimonial
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, testimonial, rating, videoUrl,role } = body;

        // Validate input
        if (!name || !testimonial||!role) {
            return NextResponse.json({ message: 'Name and testimonial content are required' }, { status: 400 });
        }

        const newTestimonial = await prisma.testimonial.create({
            data: {
                name,
                content: testimonial,
                role, 
                rating: Number(rating) || 5,
                url: videoUrl || '',
            },
        });

        // Return formatted testimonial to match component interface
        return NextResponse.json({
            id: newTestimonial.id,
            name: newTestimonial.name,
            role: newTestimonial.role,
            testimonial: newTestimonial.content,
            rating: newTestimonial.rating,
            videoUrl: newTestimonial.url,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json({ message: 'Failed to create testimonial' }, { status: 500 });
    }
}
