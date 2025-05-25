import { NextRequest, NextResponse } from 'next/server';

// Mapping of ticket type names to default images
const defaultImages: Record<string, string> = {
    "Adult": "/images/ic-ticket.svg",
    "Child": "/images/ic-ticket.svg",
    "Senior": "/images/ic-ticket.svg",
    "Student": "/images/pro_student.png",
    "VIP": "/images/pro_MEMBER.png",
    "default": "/images/ic-ticket.svg"
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const typeName = searchParams.get('type') || '';

    // Get the matching image URL or use default
    const imageUrl = defaultImages[typeName] || defaultImages.default;

    // Return a redirect response to the appropriate image
    return NextResponse.redirect(new URL(imageUrl, request.url));
}
