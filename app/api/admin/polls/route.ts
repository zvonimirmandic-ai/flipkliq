import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCloudinaryUploadErrorMessage, uploadImage } from "@/lib/cloudinary";
import { getPollsWithVoteCounts } from "@/lib/polls";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLL_CATEGORIES } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const polls = await getPollsWithVoteCounts();
    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Failed to fetch polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const optionALabel = String(formData.get("option_a_label") ?? "").trim();
    const optionBLabel = String(formData.get("option_b_label") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const status = String(formData.get("status") ?? "draft");
    const optionAImage = formData.get("option_a_image");
    const optionBImage = formData.get("option_b_image");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!(optionAImage instanceof File) || optionAImage.size === 0) {
      return NextResponse.json(
        { error: "Option A image is required" },
        { status: 400 },
      );
    }

    if (!(optionBImage instanceof File) || optionBImage.size === 0) {
      return NextResponse.json(
        { error: "Option B image is required" },
        { status: 400 },
      );
    }

    if (!POLL_CATEGORIES.includes(category as (typeof POLL_CATEGORIES)[number])) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (status !== "draft" && status !== "active") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [optionAUrl, optionBUrl] = await Promise.all([
      uploadImage(optionAImage),
      uploadImage(optionBImage),
    ]);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .insert({
        title,
        option_a_image: optionAUrl,
        option_b_image: optionBUrl,
        option_a_label: optionALabel || null,
        option_b_label: optionBLabel || null,
        category,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create poll:", error);
      return NextResponse.json(
        { error: "Failed to create poll" },
        { status: 500 },
      );
    }

    return NextResponse.json({ poll: data }, { status: 201 });
  } catch (error) {
    console.error("Failed to create poll:", error);
    return NextResponse.json(
      { error: getCloudinaryUploadErrorMessage(error) },
      { status: 500 },
    );
  }
}
