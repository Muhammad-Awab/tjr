import { NextResponse } from 'next/server'
import prisma from "@/lib/db"

// Get all users
export async function GET() {
    try {
        const users = await prisma.user.findMany()
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 })
    }
}

// Create a new user
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, role, password } = body

        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { message: 'Name, email, password, and role are required' }, 
                { status: 400 }
            )
        }

        const newUser = await prisma.user.create({
            data: { name, email, role, password }
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
    }
}
