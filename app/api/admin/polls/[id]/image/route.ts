import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCloudinaryUploadErrorMessage, uploadImage } from "@/lib/cloudinary";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const side = String(formData.get("side") ?? "");
    const image = formData.get("image");

    if (side !== "a" && side !== "b") {
      return NextResponse.json(
        { error: "side must be 'a' or 'b'" },
        { status: 400 },
      );
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Same upload path as poll creation.
    const imageUrl = await uploadImage(image);
    const column = side === "a" ? "option_a_image" : "option_b_image";

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .update({ [column]: imageUrl })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update poll image:", error);
      return NextResponse.json(
        { error: "Failed to update poll image" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ image_url: imageUrl, poll: data });
  } catch (error) {
    console.error("Failed to replace poll image:", error);
    return NextResponse.json(
      { error: getCloudinaryUploadErrorMessage(error) },
      { status: 500 },
    );
  }
}
