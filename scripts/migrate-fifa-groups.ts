/**
 * One-time migration: sets the `group` column on existing FIFA 2026 polls
 * by matching option_a_label + option_b_label to the MATCHES list.
 * Does NOT delete or re-insert polls — existing votes are preserved.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/migrate-fifa-groups.ts
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

// Match list — group + team names (enough to identify each poll)
const MATCHES = [
  { group: "A", teamA: "Mexico",        teamB: "South Africa" },
  { group: "A", teamA: "South Korea",   teamB: "Czechia" },
  { group: "B", teamA: "Canada",        teamB: "Bosnia and Herzegovina" },
  { group: "D", teamA: "United States", teamB: "Paraguay" },
  { group: "B", teamA: "Qatar",         teamB: "Switzerland" },
  { group: "C", teamA: "Brazil",        teamB: "Morocco" },
  { group: "C", teamA: "Haiti",         teamB: "Scotland" },
  { group: "D", teamA: "Australia",     teamB: "Türkiye" },
  { group: "E", teamA: "Germany",       teamB: "Curaçao" },
  { group: "F", teamA: "Netherlands",   teamB: "Japan" },
  { group: "E", teamA: "Ivory Coast",   teamB: "Ecuador" },
  { group: "F", teamA: "Peru",          teamB: "Saudi Arabia" },
  { group: "A", teamA: "Mexico",        teamB: "South Korea" },
  { group: "A", teamA: "South Africa",  teamB: "Czechia" },
  { group: "G", teamA: "Argentina",     teamB: "New Zealand" },
  { group: "G", teamA: "Belgium",       teamB: "Egypt" },
  { group: "H", teamA: "France",        teamB: "Kazakhstan" },
  { group: "H", teamA: "Colombia",      teamB: "Senegal" },
  { group: "I", teamA: "Spain",         teamB: "Ghana" },
  { group: "I", teamA: "Serbia",        teamB: "Chile" },
  { group: "J", teamA: "Portugal",      teamB: "Slovenia" },
  { group: "J", teamA: "Austria",       teamB: "Jordan" },
  { group: "K", teamA: "England",       teamB: "Tunisia" },
  { group: "K", teamA: "Ukraine",       teamB: "Nigeria" },
  { group: "L", teamA: "Italy",         teamB: "Cuba" },
  { group: "L", teamA: "Uruguay",       teamB: "Venezuela" },
  // Round 2
  { group: "B", teamA: "Canada",        teamB: "Qatar" },
  { group: "B", teamA: "Switzerland",   teamB: "Bosnia and Herzegovina" },
  { group: "C", teamA: "Brazil",        teamB: "Haiti" },
  { group: "C", teamA: "Scotland",      teamB: "Morocco" },
  { group: "D", teamA: "United States", teamB: "Australia" },
  { group: "D", teamA: "Türkiye",       teamB: "Paraguay" },
  { group: "E", teamA: "Germany",       teamB: "Ivory Coast" },
  { group: "E", teamA: "Ecuador",       teamB: "Curaçao" },
  { group: "F", teamA: "Netherlands",   teamB: "Peru" },
  { group: "F", teamA: "Saudi Arabia",  teamB: "Japan" },
  { group: "G", teamA: "Argentina",     teamB: "Belgium" },
  { group: "G", teamA: "Egypt",         teamB: "New Zealand" },
  { group: "H", teamA: "France",        teamB: "Colombia" },
  { group: "H", teamA: "Senegal",       teamB: "Kazakhstan" },
  { group: "I", teamA: "Spain",         teamB: "Serbia" },
  { group: "I", teamA: "Chile",         teamB: "Ghana" },
  { group: "J", teamA: "Portugal",      teamB: "Austria" },
  { group: "J", teamA: "Jordan",        teamB: "Slovenia" },
  { group: "K", teamA: "England",       teamB: "Ukraine" },
  { group: "K", teamA: "Nigeria",       teamB: "Tunisia" },
  { group: "L", teamA: "Italy",         teamB: "Uruguay" },
  { group: "L", teamA: "Venezuela",     teamB: "Cuba" },
  { group: "A", teamA: "South Africa",  teamB: "Mexico" },
  { group: "A", teamA: "Czechia",       teamB: "South Korea" },
  // Round 3
  { group: "B", teamA: "Canada",        teamB: "Switzerland" },
  { group: "B", teamA: "Bosnia and Herzegovina", teamB: "Qatar" },
  { group: "C", teamA: "Brazil",        teamB: "Scotland" },
  { group: "C", teamA: "Morocco",       teamB: "Haiti" },
  { group: "D", teamA: "United States", teamB: "Türkiye" },
  { group: "D", teamA: "Paraguay",      teamB: "Australia" },
  { group: "E", teamA: "Germany",       teamB: "Ecuador" },
  { group: "E", teamA: "Curaçao",       teamB: "Ivory Coast" },
  { group: "F", teamA: "Netherlands",   teamB: "Saudi Arabia" },
  { group: "F", teamA: "Japan",         teamB: "Peru" },
  { group: "G", teamA: "Argentina",     teamB: "Egypt" },
  { group: "G", teamA: "New Zealand",   teamB: "Belgium" },
  { group: "H", teamA: "France",        teamB: "Senegal" },
  { group: "H", teamA: "Kazakhstan",    teamB: "Colombia" },
  { group: "I", teamA: "Spain",         teamB: "Chile" },
  { group: "I", teamA: "Ghana",         teamB: "Serbia" },
  { group: "J", teamA: "Portugal",      teamB: "Jordan" },
  { group: "J", teamA: "Slovenia",      teamB: "Austria" },
  { group: "K", teamA: "England",       teamB: "Nigeria" },
  { group: "K", teamA: "Tunisia",       teamB: "Ukraine" },
  { group: "L", teamA: "Italy",         teamB: "Venezuela" },
  { group: "L", teamA: "Cuba",          teamB: "Uruguay" },
];

async function main() {
  console.log("Fetching existing FIFA 2026 polls...");

  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, option_a_label, option_b_label, group")
    .eq("category", "FIFA 2026");

  if (error) {
    console.error("Failed to fetch polls:", error.message);
    process.exit(1);
  }

  console.log(`Found ${polls.length} FIFA 2026 polls.\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const m of MATCHES) {
    const poll = polls.find(
      (p) => p.option_a_label === m.teamA && p.option_b_label === m.teamB
    );

    if (!poll) {
      console.log(`  ? Not found: ${m.teamA} vs ${m.teamB}`);
      notFound++;
      continue;
    }

    if (poll.group === m.group) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("polls")
      .update({ group: m.group })
      .eq("id", poll.id);

    if (updateError) {
      console.error(`  ✗ ${m.teamA} vs ${m.teamB}: ${updateError.message}`);
    } else {
      console.log(`  ✓ Group ${m.group}: ${m.teamA} vs ${m.teamB}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Already set: ${skipped}, Not found: ${notFound}`);
}

main();
