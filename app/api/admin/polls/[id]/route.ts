import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PollStatus } from "@/lib/types";

const VALID_STATUSES: PollStatus[] = ["draft", "active", "archived"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .update({ status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update poll:", error);
      return NextResponse.json(
        { error: "Failed to update poll" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ poll: data });
  } catch (error) {
    console.error("Failed to update poll:", error);
    return NextResponse.json(
      { error: "Failed to update poll" },
      { status: 500 },
    );
  }
}
