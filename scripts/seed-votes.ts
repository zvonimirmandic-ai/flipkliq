/**
 * Seeds realistic fake votes on the production Supabase database.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-votes.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local and inserts with the service role key, bypassing RLS.
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
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Country pool weighted by population + internet usage
const COUNTRY_POOL: string[] = [
  "US", "US", "US", "US", "US",
  "IN", "IN", "IN",
  "BR", "BR", "BR",
  "GB", "GB",
  "DE", "DE",
  "FR", "FR",
  "MX", "MX",
  "TR", "TR",
  "JP", "JP",
  "ES",
  "IT",
  "CA",
  "AU",
  "NL",
  "PL",
  "SE",
  "AR",
  "ZA",
  "NG",
  "HR",
];

function randomCountry(): string {
  return COUNTRY_POOL[Math.floor(Math.random() * COUNTRY_POOL.length)];
}

function randomFingerprint(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Natural-feeling A split: anywhere from 30% to 70%
function randomASplit(): number {
  const splits = [0.3, 0.35, 0.4, 0.45, 0.55, 0.6, 0.65, 0.7];
  return splits[Math.floor(Math.random() * splits.length)];
}

async function main() {
  console.log("Fetching active polls...");

  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, title")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch polls:", error.message);
    process.exit(1);
  }

  if (!polls || polls.length === 0) {
    console.log("No active polls found.");
    return;
  }

  console.log(`Found ${polls.length} active polls. Seeding votes...\n`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const poll of polls) {
    const totalVotes = randomInt(18, 30);
    const aSplit = randomASplit();
    const votesA = Math.round(totalVotes * aSplit);
    const votesB = totalVotes - votesA;

    console.log(
      `[${poll.title.slice(0, 45)}] → ${totalVotes} votes (A:${votesA} / B:${votesB})`
    );

    const votes = [
      ...Array.from({ length: votesA }, () => ({ choice: "a" as const })),
      ...Array.from({ length: votesB }, () => ({ choice: "b" as const })),
    ].sort(() => Math.random() - 0.5); // shuffle

    for (const vote of votes) {
      const row = {
        poll_id: poll.id,
        choice: vote.choice,
        device_fingerprint: randomFingerprint(),
        country_code: randomCountry(),
      };

      const { error: insertError } = await supabase.from("votes").insert(row);

      if (insertError) {
        if (insertError.code === "23505") {
          // Duplicate fingerprint (astronomically unlikely but handle it)
          totalSkipped++;
        } else {
          console.error(`  Insert error: ${insertError.message}`);
        }
      } else {
        totalInserted++;
      }

      await sleep(randomInt(50, 150));
    }

    console.log(`  ✓ done`);
  }

  console.log(`\nSeeding complete. Inserted: ${totalInserted}, Skipped: ${totalSkipped}`);
}

main();
