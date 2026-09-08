import { NextResponse } from "next/server";
import { persistProductImage } from "@/lib/images";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const url = await persistProductImage(bytes);
    if (!url) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Unable to save" }, { status: 500 });
  }
}
