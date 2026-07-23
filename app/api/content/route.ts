import { NextResponse } from "next/server";
import { readSiteContent } from "@/lib/content/store";

export async function GET() {
  const content = await readSiteContent();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
