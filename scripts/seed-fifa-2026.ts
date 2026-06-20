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
  title?: string;
  comment?: string;
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
  {
    group: "K", teamA: "Portugal", teamB: "DR Congo", isoA: "pt", isoB: "cd", kickoff: "2026-06-17T17:00:00Z",
    title: "Which side has the better chance to keep the dream alive?",
    comment: "One nation is dreaming big. The other is dreaming bigger.",
  },
  {
    group: "L", teamA: "England", teamB: "Croatia", isoA: "gb-eng", isoB: "hr", kickoff: "2026-06-17T20:00:00Z",
    title: "If only one can move on, who gets your vote?",
    comment: "This one might split the internet in half.",
  },
  {
    group: "L", teamA: "Ghana", teamB: "Panama", isoA: "gh", isoB: "pa", kickoff: "2026-06-17T23:00:00Z",
    title: "Who takes the next step toward glory?",
    comment: "No safe picks here. Trust your instincts.",
  },
  {
    group: "K", teamA: "Uzbekistan", teamB: "Colombia", isoA: "uz", isoB: "co", kickoff: "2026-06-18T02:00:00Z",
    title: "Which team looks more ready for the challenge ahead?",
    comment: "Underdog energy is strong in this matchup.",
  },

  // ── June 18 ────────────────────────────────────────────────────────────────
  {
    group: "A", teamA: "Czechia", teamB: "South Africa", isoA: "cz", isoB: "za", kickoff: "2026-06-18T16:00:00Z",
    title: "Who deserves a ticket to the next round?",
    comment: "Someone's journey continues. Someone's ends here.",
  },
  {
    group: "B", teamA: "Switzerland", teamB: "Bosnia and Herzegovina", isoA: "ch", isoB: "ba", kickoff: "2026-06-18T19:00:00Z",
    title: "Which nation would you trust in a must-win moment?",
    comment: "A true test of belief versus expectation.",
  },
  {
    group: "B", teamA: "Canada", teamB: "Qatar", isoA: "ca", isoB: "qa", kickoff: "2026-06-18T22:00:00Z",
    title: "Who has more to offer on the biggest stage?",
    comment: "Two very different paths. One destination.",
  },
  {
    group: "A", teamA: "Mexico", teamB: "South Korea", isoA: "mx", isoB: "kr", kickoff: "2026-06-19T03:00:00Z",
    title: "Which side would you back with everything on the line?",
    comment: "This feels way closer than people think.",
  },

  // ── June 19 ────────────────────────────────────────────────────────────────
  {
    group: "D", teamA: "United States", teamB: "Australia", isoA: "us", isoB: "au", kickoff: "2026-06-19T19:00:00Z",
    title: "Which team is built for knockout football?",
    comment: "Expect passionate votes on both sides.",
  },
  {
    group: "C", teamA: "Scotland", teamB: "Morocco", isoA: "gb-sct", isoB: "ma", kickoff: "2026-06-19T22:00:00Z",
    title: "Who looks more dangerous when it matters most?",
    comment: "A matchup football romantics will love.",
  },
  {
    group: "C", teamA: "Brazil", teamB: "Haiti", isoA: "br", isoB: "ht", kickoff: "2026-06-20T01:00:00Z",
    title: "Which side would you expect to rise above the pressure?",
    comment: "Sometimes football ignores logic completely.",
  },
  {
    group: "D", teamA: "Türkiye", teamB: "Paraguay", isoA: "tr", isoB: "py", kickoff: "2026-06-20T04:00:00Z",
    title: "Who has the edge in this crucial showdown?",
    comment: "This one could surprise a lot of people.",
  },

  // ── June 20 ────────────────────────────────────────────────────────────────
  {
    group: "F", teamA: "Netherlands", teamB: "Sweden", isoA: "nl", isoB: "se", kickoff: "2026-06-20T17:00:00Z",
    title: "Which nation feels more likely to go all the way?",
    comment: "Serious contender vibes from both camps.",
  },
  {
    group: "E", teamA: "Germany", teamB: "Ivory Coast", isoA: "de", isoB: "ci", kickoff: "2026-06-20T20:00:00Z",
    title: "Who would you rather have on your side in a winner-takes-all match?",
    comment: "No room for hesitation in this vote.",
  },
  {
    group: "E", teamA: "Ecuador", teamB: "Curaçao", isoA: "ec", isoB: "cw", kickoff: "2026-06-21T00:00:00Z",
    title: "Which team has earned your confidence?",
    comment: "Every tournament creates a surprise story.",
  },
  {
    group: "F", teamA: "Tunisia", teamB: "Japan", isoA: "tn", isoB: "jp", kickoff: "2026-06-21T04:00:00Z",
    title: "Who makes the stronger case for advancement?",
    comment: "The comments section may be more intense than the match.",
  },

  // ── June 21 ────────────────────────────────────────────────────────────────
  {
    group: "H", teamA: "Spain", teamB: "Saudi Arabia", isoA: "es", isoB: "sa", kickoff: "2026-06-21T16:00:00Z",
    title: "Which side looks most prepared for the next challenge?",
    comment: "One vote can change the entire mood of the standings.",
  },
  {
    group: "G", teamA: "Belgium", teamB: "Iran", isoA: "be", isoB: "ir", kickoff: "2026-06-21T19:00:00Z",
    title: "If your prediction had to be right, who would you pick?",
    comment: "Confidence is easy. Predictions are harder.",
  },
  {
    group: "H", teamA: "Uruguay", teamB: "Cape Verde", isoA: "uy", isoB: "cv", kickoff: "2026-06-21T22:00:00Z",
    title: "Who has the momentum to keep moving forward?",
    comment: "Momentum is real. Until it isn't.",
  },
  {
    group: "G", teamA: "New Zealand", teamB: "Egypt", isoA: "nz", isoB: "eg", kickoff: "2026-06-22T01:00:00Z",
    title: "Which nation can seize the moment?",
    comment: "One side leaves smiling. Which one?",
  },

  // ── June 22 ────────────────────────────────────────────────────────────────
  {
    group: "J", teamA: "Argentina", teamB: "Austria", isoA: "ar", isoB: "at", kickoff: "2026-06-22T17:00:00Z",
    title: "Who has what it takes to survive and advance?",
    comment: "Big names don't guarantee big results.",
  },
  {
    group: "I", teamA: "France", teamB: "Iraq", isoA: "fr", isoB: "iq", kickoff: "2026-06-22T21:00:00Z",
    title: "Which side would you trust to get the job done?",
    comment: "The crowd may already know the answer. Or not.",
  },
  {
    group: "I", teamA: "Norway", teamB: "Senegal", isoA: "no", isoB: "sn", kickoff: "2026-06-23T00:00:00Z",
    title: "Who looks stronger heading into this battle?",
    comment: "This feels like a coin flip with consequences.",
  },
  {
    group: "J", teamA: "Jordan", teamB: "Algeria", isoA: "jo", isoB: "dz", kickoff: "2026-06-23T03:00:00Z",
    title: "Which nation should be feared more by future opponents?",
    comment: "Reputation meets opportunity.",
  },

  // ── June 23 ────────────────────────────────────────────────────────────────
  {
    group: "K", teamA: "Portugal", teamB: "Uzbekistan", isoA: "pt", isoB: "uz", kickoff: "2026-06-23T17:00:00Z",
    title: "Who takes control of their own destiny?",
    comment: "Every point matters from here.",
  },
  {
    group: "L", teamA: "England", teamB: "Ghana", isoA: "gb-eng", isoB: "gh", kickoff: "2026-06-23T20:00:00Z",
    title: "Which side is more likely to leave a mark on the tournament?",
    comment: "Future headlines might start right here.",
  },
  {
    group: "L", teamA: "Panama", teamB: "Croatia", isoA: "pa", isoB: "hr", kickoff: "2026-06-23T23:00:00Z",
    title: "Who deserves to stay in the hunt?",
    comment: "Somebody's dream stays alive tonight.",
  },
  {
    group: "K", teamA: "Colombia", teamB: "DR Congo", isoA: "co", isoB: "cd", kickoff: "2026-06-24T02:00:00Z",
    title: "Which team has the brighter path ahead?",
    comment: "Expect strong opinions and zero compromises.",
  },

  // ── June 24 — simultaneous final group games ────────────────────────────────
  {
    group: "B", teamA: "Switzerland", teamB: "Canada", isoA: "ch", isoB: "ca", kickoff: "2026-06-24T19:00:00Z",
    title: "Who looks more capable of handling the pressure?",
    comment: "Pressure creates heroes. And heartbreak.",
  },
  {
    group: "B", teamA: "Bosnia and Herzegovina", teamB: "Qatar", isoA: "ba", isoB: "qa", kickoff: "2026-06-24T19:00:00Z",
    title: "Which side has the better shot at moving on?",
    comment: "A lot more is on the line than three points.",
  },
  {
    group: "C", teamA: "Scotland", teamB: "Brazil", isoA: "gb-sct", isoB: "br", kickoff: "2026-06-24T22:00:00Z",
    title: "Who would you bet on when everything is at stake?",
    comment: "The voting results could be fascinating.",
  },
  {
    group: "C", teamA: "Morocco", teamB: "Haiti", isoA: "ma", isoB: "ht", kickoff: "2026-06-24T22:00:00Z",
    title: "Which nation is ready for the next level?",
    comment: "This is where tournaments get interesting.",
  },
  {
    group: "A", teamA: "Czechia", teamB: "Mexico", isoA: "cz", isoB: "mx", kickoff: "2026-06-25T01:00:00Z",
    title: "Who has shown enough to deserve your backing?",
    comment: "One step closer to glory.",
  },
  {
    group: "A", teamA: "South Africa", teamB: "South Korea", isoA: "za", isoB: "kr", kickoff: "2026-06-25T01:00:00Z",
    title: "Which team would you trust in a decisive match?",
    comment: "No easy path from here onward.",
  },

  // ── June 25 ────────────────────────────────────────────────────────────────
  {
    group: "E", teamA: "Ecuador", teamB: "Germany", isoA: "ec", isoB: "de", kickoff: "2026-06-25T20:00:00Z",
    title: "Which side has the stronger winning mentality?",
    comment: "One side brings belief. The other brings expectations.",
  },
  {
    group: "E", teamA: "Curaçao", teamB: "Ivory Coast", isoA: "cw", isoB: "ci", kickoff: "2026-06-25T20:00:00Z",
    title: "Who can keep their journey alive?",
    comment: "A chance to become the tournament's surprise package.",
  },
  {
    group: "F", teamA: "Japan", teamB: "Sweden", isoA: "jp", isoB: "se", kickoff: "2026-06-25T23:00:00Z",
    title: "Which team feels more complete right now?",
    comment: "Tactical battle or chaos? You decide.",
  },
  {
    group: "F", teamA: "Tunisia", teamB: "Netherlands", isoA: "tn", isoB: "nl", kickoff: "2026-06-25T23:00:00Z",
    title: "Who looks best equipped for the road ahead?",
    comment: "One vote. One prediction. No excuses.",
  },
  {
    group: "D", teamA: "Türkiye", teamB: "United States", isoA: "tr", isoB: "us", kickoff: "2026-06-26T02:00:00Z",
    title: "Which side would you rather face later in the tournament?",
    comment: "This matchup deserves more attention.",
  },
  {
    group: "D", teamA: "Paraguay", teamB: "Australia", isoA: "py", isoB: "au", kickoff: "2026-06-26T02:00:00Z",
    title: "Who has the better chance to make a statement?",
    comment: "Opportunity knocks only once.",
  },

  // ── June 26 ────────────────────────────────────────────────────────────────
  {
    group: "I", teamA: "Norway", teamB: "France", isoA: "no", isoB: "fr", kickoff: "2026-06-26T19:00:00Z",
    title: "Which nation is more likely to finish the job?",
    comment: "Two ambitions. One available ticket.",
  },
  {
    group: "I", teamA: "Senegal", teamB: "Iraq", isoA: "sn", isoB: "iq", kickoff: "2026-06-26T19:00:00Z",
    title: "Who deserves the spotlight after this clash?",
    comment: "This one feels bigger than it looks.",
  },
  {
    group: "H", teamA: "Cape Verde", teamB: "Saudi Arabia", isoA: "cv", isoB: "sa", kickoff: "2026-06-27T00:00:00Z",
    title: "Which side has more fight left in them?",
    comment: "The dream is still alive for both sides.",
  },
  {
    group: "H", teamA: "Uruguay", teamB: "Spain", isoA: "uy", isoB: "es", kickoff: "2026-06-27T00:00:00Z",
    title: "Who would you trust with your tournament life?",
    comment: "Heavyweight energy detected.",
  },
  {
    group: "G", teamA: "Egypt", teamB: "Iran", isoA: "eg", isoB: "ir", kickoff: "2026-06-27T03:00:00Z",
    title: "Which nation has the higher ceiling?",
    comment: "Someone's confidence is about to be tested.",
  },
  {
    group: "G", teamA: "New Zealand", teamB: "Belgium", isoA: "nz", isoB: "be", kickoff: "2026-06-27T03:00:00Z",
    title: "Who should be feeling more confident right now?",
    comment: "Expect debate. Lots of debate.",
  },

  // ── June 27 ────────────────────────────────────────────────────────────────
  {
    group: "L", teamA: "Panama", teamB: "England", isoA: "pa", isoB: "gb-eng", kickoff: "2026-06-27T21:00:00Z",
    title: "Which side is better positioned for success?",
    comment: "Every vote tells a story.",
  },
  {
    group: "L", teamA: "Croatia", teamB: "Ghana", isoA: "hr", isoB: "gh", kickoff: "2026-06-27T21:00:00Z",
    title: "Who looks more convincing heading into this battle?",
    comment: "National pride is definitely involved here.",
  },
  {
    group: "K", teamA: "Colombia", teamB: "Portugal", isoA: "co", isoB: "pt", kickoff: "2026-06-27T23:30:00Z",
    title: "Which nation belongs among the contenders?",
    comment: "Contender status is on the line.",
  },
  {
    group: "K", teamA: "DR Congo", teamB: "Uzbekistan", isoA: "cd", isoB: "uz", kickoff: "2026-06-27T23:30:00Z",
    title: "Who has the stronger claim to move forward?",
    comment: "One side moves forward. The other watches.",
  },
  {
    group: "J", teamA: "Algeria", teamB: "Austria", isoA: "dz", isoB: "at", kickoff: "2026-06-28T02:00:00Z",
    title: "Which team would you rather see in the next round?",
    comment: "This could be one of the sleeper matchups of the round.",
  },
  {
    group: "J", teamA: "Jordan", teamB: "Argentina", isoA: "jo", isoB: "ar", kickoff: "2026-06-28T02:00:00Z",
    title: "Who has the quality to keep the dream alive?",
    comment: "Football has a habit of creating impossible stories.",
  },
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
      title: m.title ?? `Group ${m.group}: ${m.teamA} vs ${m.teamB} — who goes through?`,
      option_a_image: flagUrl(m.isoA),
      option_b_image: flagUrl(m.isoB),
      option_a_label: m.teamA,
      option_b_label: m.teamB,
      category: "FIFA 2026",
      group: m.group,
      status: "active",
      closes_at: closesAt(m.kickoff),
      created_at: createdAt(m.kickoff),
      comment: m.comment ?? null,
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
