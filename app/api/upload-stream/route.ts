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
      contentType: request.headers.get("content-type") || "application/octet-stream",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("UPLOAD_STREAM_ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload thất bại" },
      { status: 500 },
    );
  }
}
