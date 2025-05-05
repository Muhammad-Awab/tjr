// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Get email from query parameters
        const email = req.nextUrl.searchParams.get('email');
        if (!email) {
            return NextResponse.json(
                { error: 'Email query parameter is required' },
                { status: 400 }
            );
        }

        // Log the email for debugging
        console.log(`Fetching profile for email: ${email}`);

        // Query the profile
        const profile = await prisma.profile.findUnique({
            where: { email },
            select: {
                email: true,
                name: true,
                url: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 200 }
            );
        }

        // Ensure all fields have empty strings if null/undefined
        const sanitizedProfile = {
            email: profile.email || "",
            name: profile.name || "",
            url: profile.url || "",
        };

        return NextResponse.json(sanitizedProfile, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}