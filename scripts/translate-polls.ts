/**
 * Translates Croatian / mixed-language poll titles and option labels to
 * English directly in Supabase.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/translate-polls.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local and updates with the service role key, bypassing RLS.
 * Idempotent: rows already in English are left untouched.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

// Poll title translations.
const TITLE_MAP: Record<string, string> = {
  "Argentina ili Alžir?": "Argentina or Algeria?",
  "Španjolska ili Uruguay?": "Spain or Uruguay?",
  "Engleska ili Hrvatska?": "England or Croatia?",
  "Njemačka ili Obala Bjelokosti?": "Germany or Ivory Coast?",
  "Tulipani ili Sunce Istoka?": "Netherlands or Japan?",
  "Brazil ili Maroko?": "Brazil or Morocco?",
  "SAD ili Paraguay?": "USA or Paraguay?",
  "Domaćin ili autsajder?": "Canada or Bosnia?",
  "Tko prolazi grupu A?": "Who advances from Group A?",
  "Iznenađenje grupe A?": "Group A Surprise?",
  // Not in the supplied list, but Croatian — translated for completeness.
  "Koji dizajn 2?": "Which design 2?",
};

// Croatian country / option-label names → English. Applied defensively;
// current data already has English labels, so these are no-ops today.
const LABEL_MAP: Record<string, string> = {
  Alžir: "Algeria",
  Španjolska: "Spain",
  Hrvatska: "Croatia",
  Njemačka: "Germany",
  Maroko: "Morocco",
  "Obala Bjelokosti": "Ivory Coast",
  Tulipani: "Netherlands",
  "Sunce Istoka": "Japan",
  SAD: "USA",
  Domaćin: "Host",
  Autsajder: "Underdog",
  Engleska: "England",
};

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, title, option_a_label, option_b_label");

  if (error) throw error;

  let updated = 0;
  let unchanged = 0;

  for (const poll of polls ?? []) {
    const newTitle = TITLE_MAP[poll.title] ?? poll.title;
    const newA = poll.option_a_label
      ? LABEL_MAP[poll.option_a_label] ?? poll.option_a_label
      : poll.option_a_label;
    const newB = poll.option_b_label
      ? LABEL_MAP[poll.option_b_label] ?? poll.option_b_label
      : poll.option_b_label;

    if (
      newTitle === poll.title &&
      newA === poll.option_a_label &&
      newB === poll.option_b_label
    ) {
      unchanged += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("polls")
      .update({
        title: newTitle,
        option_a_label: newA,
        option_b_label: newB,
      })
      .eq("id", poll.id);

    if (updateError) {
      console.error(`Failed to update ${poll.id}:`, updateError.message);
      continue;
    }

    console.log(`  "${poll.title}" → "${newTitle}"`);
    if (newA !== poll.option_a_label) console.log(`     A: ${poll.option_a_label} → ${newA}`);
    if (newB !== poll.option_b_label) console.log(`     B: ${poll.option_b_label} → ${newB}`);
    updated += 1;
  }

  console.log(`\nDone. Updated ${updated} poll(s), ${unchanged} already English.`);
}

main().catch((error) => {
  console.error("Translation failed:", error);
  process.exit(1);
});
