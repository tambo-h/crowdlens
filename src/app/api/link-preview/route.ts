import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        const html = await response.text();

        const getMeta = (name: string) => {
            const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"))
                || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i"));
            return match ? match[1] : null;
        };

        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const title = getMeta("og:title") || (titleMatch ? titleMatch[1] : url);
        const description = getMeta("og:description") || getMeta("description") || "";
        const image = getMeta("og:image") || "";

        return NextResponse.json({ title, description, image });
    } catch (error) {
        console.error("Link preview error:", error);
        return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
    }
}
