import { NextResponse } from "next/server";

export async function GET() {
    // This endpoint seeds mock data for demonstration purposes
    // In production, this would populate a Supabase database
    return NextResponse.json({
        message: "Demo data seeded successfully!",
        data: {
            doctors: 5,
            companies: 2,
            batches: 3,
            annotations: 847,
        },
    });
}
