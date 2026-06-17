/**
 * Deletes all existing FIFA 2026 polls (and their votes) then inserts every
 * group-stage match with closes_at set to 2 hours after kickoff.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-fifa-2026.ts
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

function flagUrl(iso2: string): string {
  return `https://flagcdn.com/w640/${iso2.toLowerCase()}.png`;
}

function closesAt(kickoff: string): string {
  return new Date(new Date(kickoff).getTime() + 2 * 60 * 60 * 1000).toISOString();
}

function createdAt(kickoff: string): string {
  return new Date(new Date(kickoff).getTime() - 24 * 60 * 60 * 1000).toISOString();
}

type Match = {
  group: string;
  teamA: string;
  teamB: string;
  isoA: string;
  isoB: string;
  kickoff: string;
};

const MATCHES: Match[] = [
  // ── June 11 ────────────────────────────────────────────────────────────────
  { group: "A", teamA: "Mexico",      teamB: "South Africa", isoA: "mx",     isoB: "za",     kickoff: "2026-06-11T19:00:00Z" },
  { group: "A", teamA: "South Korea", teamB: "Czechia",      isoA: "kr",     isoB: "cz",     kickoff: "2026-06-11T22:00:00Z" },

  // ── June 12 ────────────────────────────────────────────────────────────────
  { group: "B", teamA: "Canada",        teamB: "Bosnia and Herzegovina", isoA: "ca", isoB: "ba", kickoff: "2026-06-12T19:00:00Z" },
  { group: "D", teamA: "United States", teamB: "Paraguay",               isoA: "us", isoB: "py", kickoff: "2026-06-13T01:00:00Z" },

  // ── June 13 ────────────────────────────────────────────────────────────────
  { group: "B", teamA: "Qatar",     teamB: "Switzerland", isoA: "qa",     isoB: "ch",     kickoff: "2026-06-13T16:00:00Z" },
  { group: "C", teamA: "Brazil",    teamB: "Morocco",     isoA: "br",     isoB: "ma",     kickoff: "2026-06-13T19:00:00Z" },
  { group: "C", teamA: "Haiti",     teamB: "Scotland",    isoA: "ht",     isoB: "gb-sct", kickoff: "2026-06-13T22:00:00Z" },
  { group: "D", teamA: "Australia", teamB: "Türkiye",     isoA: "au",     isoB: "tr",     kickoff: "2026-06-14T01:00:00Z" },

  // ── June 14 ────────────────────────────────────────────────────────────────
  { group: "E", teamA: "Germany",     teamB: "Curaçao", isoA: "de", isoB: "cw", kickoff: "2026-06-14T17:00:00Z" },
  { group: "F", teamA: "Netherlands", teamB: "Japan",   isoA: "nl", isoB: "jp", kickoff: "2026-06-14T19:00:00Z" },
  { group: "E", teamA: "Ivory Coast", teamB: "Ecuador", isoA: "ci", isoB: "ec", kickoff: "2026-06-14T22:00:00Z" },
  { group: "F", teamA: "Sweden",      teamB: "Tunisia", isoA: "se", isoB: "tn", kickoff: "2026-06-15T02:00:00Z" },

  // ── June 15 ────────────────────────────────────────────────────────────────
  { group: "H", teamA: "Spain",        teamB: "Cape Verde",  isoA: "es", isoB: "cv", kickoff: "2026-06-15T16:00:00Z" },
  { group: "G", teamA: "Belgium",      teamB: "Egypt",       isoA: "be", isoB: "eg", kickoff: "2026-06-15T22:00:00Z" },
  { group: "H", teamA: "Saudi Arabia", teamB: "Uruguay",     isoA: "sa", isoB: "uy", kickoff: "2026-06-15T22:00:00Z" },
  { group: "G", teamA: "Iran",         teamB: "New Zealand", isoA: "ir", isoB: "nz", kickoff: "2026-06-16T04:00:00Z" },

  // ── June 16 ────────────────────────────────────────────────────────────────
  { group: "I", teamA: "France",    teamB: "Senegal",  isoA: "fr", isoB: "sn", kickoff: "2026-06-16T19:00:00Z" },
  { group: "I", teamA: "Iraq",      teamB: "Norway",   isoA: "iq", isoB: "no", kickoff: "2026-06-16T22:00:00Z" },
  { group: "J", teamA: "Argentina", teamB: "Algeria",  isoA: "ar", isoB: "dz", kickoff: "2026-06-17T01:00:00Z" },
  { group: "J", teamA: "Austria",   teamB: "Jordan",   isoA: "at", isoB: "jo", kickoff: "2026-06-17T04:00:00Z" },

  // ── June 17 ────────────────────────────────────────────────────────────────
  { group: "K", teamA: "Portugal",   teamB: "DR Congo",  isoA: "pt",     isoB: "cd", kickoff: "2026-06-17T17:00:00Z" },
  { group: "L", teamA: "England",    teamB: "Croatia",   isoA: "gb-eng", isoB: "hr", kickoff: "2026-06-17T20:00:00Z" },
  { group: "L", teamA: "Ghana",      teamB: "Panama",    isoA: "gh",     isoB: "pa", kickoff: "2026-06-17T23:00:00Z" },
  { group: "K", teamA: "Uzbekistan", teamB: "Colombia",  isoA: "uz",     isoB: "co", kickoff: "2026-06-18T02:00:00Z" },

  // ── June 18 ────────────────────────────────────────────────────────────────
  { group: "A", teamA: "Czechia",     teamB: "South Africa",          isoA: "cz", isoB: "za", kickoff: "2026-06-18T16:00:00Z" },
  { group: "B", teamA: "Switzerland", teamB: "Bosnia and Herzegovina", isoA: "ch", isoB: "ba", kickoff: "2026-06-18T19:00:00Z" },
  { group: "B", teamA: "Canada",      teamB: "Qatar",                 isoA: "ca", isoB: "qa", kickoff: "2026-06-18T22:00:00Z" },
  { group: "A", teamA: "Mexico",      teamB: "South Korea",           isoA: "mx", isoB: "kr", kickoff: "2026-06-19T03:00:00Z" },

  // ── June 19 ────────────────────────────────────────────────────────────────
  { group: "D", teamA: "United States", teamB: "Australia", isoA: "us",     isoB: "au", kickoff: "2026-06-19T19:00:00Z" },
  { group: "C", teamA: "Scotland",      teamB: "Morocco",   isoA: "gb-sct", isoB: "ma", kickoff: "2026-06-19T22:00:00Z" },
  { group: "C", teamA: "Brazil",        teamB: "Haiti",     isoA: "br",     isoB: "ht", kickoff: "2026-06-20T01:00:00Z" },
  { group: "D", teamA: "Türkiye",       teamB: "Paraguay",  isoA: "tr",     isoB: "py", kickoff: "2026-06-20T04:00:00Z" },

  // ── June 20 ────────────────────────────────────────────────────────────────
  { group: "F", teamA: "Netherlands", teamB: "Sweden",     isoA: "nl", isoB: "se", kickoff: "2026-06-20T17:00:00Z" },
  { group: "E", teamA: "Germany",     teamB: "Ivory Coast", isoA: "de", isoB: "ci", kickoff: "2026-06-20T20:00:00Z" },
  { group: "E", teamA: "Ecuador",     teamB: "Curaçao",    isoA: "ec", isoB: "cw", kickoff: "2026-06-21T00:00:00Z" },
  { group: "F", teamA: "Tunisia",     teamB: "Japan",      isoA: "tn", isoB: "jp", kickoff: "2026-06-21T04:00:00Z" },

  // ── June 21 ────────────────────────────────────────────────────────────────
  { group: "H", teamA: "Spain",      teamB: "Saudi Arabia", isoA: "es", isoB: "sa", kickoff: "2026-06-21T16:00:00Z" },
  { group: "G", teamA: "Belgium",    teamB: "Iran",         isoA: "be", isoB: "ir", kickoff: "2026-06-21T19:00:00Z" },
  { group: "H", teamA: "Uruguay",    teamB: "Cape Verde",   isoA: "uy", isoB: "cv", kickoff: "2026-06-21T22:00:00Z" },
  { group: "G", teamA: "New Zealand", teamB: "Egypt",       isoA: "nz", isoB: "eg", kickoff: "2026-06-22T01:00:00Z" },

  // ── June 22 ────────────────────────────────────────────────────────────────
  { group: "J", teamA: "Argentina", teamB: "Austria",  isoA: "ar", isoB: "at", kickoff: "2026-06-22T17:00:00Z" },
  { group: "I", teamA: "France",    teamB: "Iraq",     isoA: "fr", isoB: "iq", kickoff: "2026-06-22T21:00:00Z" },
  { group: "I", teamA: "Norway",    teamB: "Senegal",  isoA: "no", isoB: "sn", kickoff: "2026-06-23T00:00:00Z" },
  { group: "J", teamA: "Jordan",    teamB: "Algeria",  isoA: "jo", isoB: "dz", kickoff: "2026-06-23T03:00:00Z" },

  // ── June 23 ────────────────────────────────────────────────────────────────
  { group: "K", teamA: "Portugal",   teamB: "Uzbekistan", isoA: "pt",     isoB: "uz", kickoff: "2026-06-23T17:00:00Z" },
  { group: "L", teamA: "England",    teamB: "Ghana",      isoA: "gb-eng", isoB: "gh", kickoff: "2026-06-23T20:00:00Z" },
  { group: "L", teamA: "Panama",     teamB: "Croatia",    isoA: "pa",     isoB: "hr", kickoff: "2026-06-23T23:00:00Z" },
  { group: "K", teamA: "Colombia",   teamB: "DR Congo",   isoA: "co",     isoB: "cd", kickoff: "2026-06-24T02:00:00Z" },

  // ── June 24 — simultaneous final group games ────────────────────────────────
  { group: "B", teamA: "Switzerland",          teamB: "Canada",      isoA: "ch",     isoB: "ca", kickoff: "2026-06-24T19:00:00Z" },
  { group: "B", teamA: "Bosnia and Herzegovina", teamB: "Qatar",     isoA: "ba",     isoB: "qa", kickoff: "2026-06-24T19:00:00Z" },
  { group: "C", teamA: "Scotland",              teamB: "Brazil",     isoA: "gb-sct", isoB: "br", kickoff: "2026-06-24T22:00:00Z" },
  { group: "C", teamA: "Morocco",               teamB: "Haiti",      isoA: "ma",     isoB: "ht", kickoff: "2026-06-24T22:00:00Z" },
  { group: "A", teamA: "Czechia",               teamB: "Mexico",     isoA: "cz",     isoB: "mx", kickoff: "2026-06-25T01:00:00Z" },
  { group: "A", teamA: "South Africa",          teamB: "South Korea", isoA: "za",    isoB: "kr", kickoff: "2026-06-25T01:00:00Z" },

  // ── June 25 ────────────────────────────────────────────────────────────────
  { group: "E", teamA: "Ecuador",     teamB: "Germany",     isoA: "ec", isoB: "de", kickoff: "2026-06-25T20:00:00Z" },
  { group: "E", teamA: "Curaçao",     teamB: "Ivory Coast", isoA: "cw", isoB: "ci", kickoff: "2026-06-25T20:00:00Z" },
  { group: "F", teamA: "Japan",       teamB: "Sweden",      isoA: "jp", isoB: "se", kickoff: "2026-06-25T23:00:00Z" },
  { group: "F", teamA: "Tunisia",     teamB: "Netherlands", isoA: "tn", isoB: "nl", kickoff: "2026-06-25T23:00:00Z" },
  { group: "D", teamA: "Türkiye",     teamB: "United States", isoA: "tr", isoB: "us", kickoff: "2026-06-26T02:00:00Z" },
  { group: "D", teamA: "Paraguay",    teamB: "Australia",   isoA: "py", isoB: "au", kickoff: "2026-06-26T02:00:00Z" },

  // ── June 26 ────────────────────────────────────────────────────────────────
  { group: "I", teamA: "Norway",      teamB: "France",        isoA: "no", isoB: "fr", kickoff: "2026-06-26T19:00:00Z" },
  { group: "I", teamA: "Senegal",     teamB: "Iraq",          isoA: "sn", isoB: "iq", kickoff: "2026-06-26T19:00:00Z" },
  { group: "H", teamA: "Cape Verde",  teamB: "Saudi Arabia",  isoA: "cv", isoB: "sa", kickoff: "2026-06-27T00:00:00Z" },
  { group: "H", teamA: "Uruguay",     teamB: "Spain",         isoA: "uy", isoB: "es", kickoff: "2026-06-27T00:00:00Z" },
  { group: "G", teamA: "Egypt",       teamB: "Iran",          isoA: "eg", isoB: "ir", kickoff: "2026-06-27T03:00:00Z" },
  { group: "G", teamA: "New Zealand", teamB: "Belgium",       isoA: "nz", isoB: "be", kickoff: "2026-06-27T03:00:00Z" },

  // ── June 27 ────────────────────────────────────────────────────────────────
  { group: "L", teamA: "Panama",   teamB: "England",    isoA: "pa",     isoB: "gb-eng", kickoff: "2026-06-27T21:00:00Z" },
  { group: "L", teamA: "Croatia",  teamB: "Ghana",      isoA: "hr",     isoB: "gh",     kickoff: "2026-06-27T21:00:00Z" },
  { group: "K", teamA: "Colombia", teamB: "Portugal",   isoA: "co",     isoB: "pt",     kickoff: "2026-06-27T23:30:00Z" },
  { group: "K", teamA: "DR Congo", teamB: "Uzbekistan", isoA: "cd",     isoB: "uz",     kickoff: "2026-06-27T23:30:00Z" },
  { group: "J", teamA: "Algeria",  teamB: "Austria",    isoA: "dz",     isoB: "at",     kickoff: "2026-06-28T02:00:00Z" },
  { group: "J", teamA: "Jordan",   teamB: "Argentina",  isoA: "jo",     isoB: "ar",     kickoff: "2026-06-28T02:00:00Z" },
];

async function main() {
  // ── 1. Delete existing FIFA 2026 polls and their votes ─────────────────────
  console.log("Fetching existing FIFA 2026 polls...");
  const { data: existingPolls, error: fetchErr } = await supabase
    .from("polls")
    .select("id")
    .eq("category", "FIFA 2026");

  if (fetchErr) {
    console.error("Failed to fetch existing polls:", fetchErr.message);
    process.exit(1);
  }

  const existingIds = (existingPolls ?? []).map((p) => p.id);
  console.log(`Found ${existingIds.length} existing FIFA 2026 polls.`);

  if (existingIds.length > 0) {
    const { error: delVotesErr } = await supabase
      .from("votes")
      .delete()
      .in("poll_id", existingIds);
    if (delVotesErr) {
      console.error("Failed to delete votes:", delVotesErr.message);
      process.exit(1);
    }
    console.log(`  Deleted votes for ${existingIds.length} polls.`);

    const { error: delPollsErr } = await supabase
      .from("polls")
      .delete()
      .in("id", existingIds);
    if (delPollsErr) {
      console.error("Failed to delete polls:", delPollsErr.message);
      process.exit(1);
    }
    console.log(`  Deleted ${existingIds.length} polls.`);
  }

  // ── 2. Insert new matches ──────────────────────────────────────────────────
  console.log(`\nInserting ${MATCHES.length} FIFA 2026 group-stage matches...\n`);

  let inserted = 0;
  let failed = 0;

  for (const m of MATCHES) {
    const row = {
      title: `Group ${m.group}: ${m.teamA} vs ${m.teamB} — who goes through?`,
      option_a_image: flagUrl(m.isoA),
      option_b_image: flagUrl(m.isoB),
      option_a_label: m.teamA,
      option_b_label: m.teamB,
      category: "FIFA 2026",
      status: "active",
      closes_at: closesAt(m.kickoff),
      created_at: createdAt(m.kickoff),
    };

    const { error } = await supabase.from("polls").insert(row);
    if (error) {
      console.error(`  ✗ ${row.title}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${row.title}`);
      inserted++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Failed: ${failed}`);
}

main();
