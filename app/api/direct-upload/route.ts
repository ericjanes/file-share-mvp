import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "file";

  try {
    if (!request.body) {
      return NextResponse.json({ error: "No file body provided" }, { status: 400 });
    }

    const blob = await put(`uploads/${Date.now()}-${filename}`, request.body, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("DIRECT_UPLOAD_ERROR:", error);
    return NextResponse.json({ error: error?.message || "Upload thất bại" }, { status: 500 });
  }
}
