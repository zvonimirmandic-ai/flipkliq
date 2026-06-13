/**
 * Sets each poll's `comment` field, matched by title.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-comments.ts
 * Reads Supabase creds from .env.local; idempotent (re-running is safe).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed
      .slice(sep + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const COMMENTS: Record<string, string> = {
  // FIFA 2026
  "Group A fires up — who rules the opener?":
    "Opening matches create heroes and villains faster than any other game. Nobody remembers a cautious draw.",
  "Group A dark horse alert — who shocks the world?":
    "Every World Cup surprise looks obvious in hindsight and impossible beforehand.",
  "Group D: Stars & Stripes or South American grit?":
    "One nation is growing the game. The other has been breathing it for generations.",
  "Group B: The host nation or the Balkan warriors?":
    "Home advantage is powerful. Balkan stubbornness might be stronger.",
  "Group C: The favourites or the magic makers?":
    "One carries expectations. The other carries chaos. Tournaments love chaos.",
  "Group E: Old guard or rising force — who advances?":
    "History wins headlines. Hunger wins games.",
  "Group F: Total football or the Rising Sun?":
    "Some teams build systems. Others build discipline. Both can look like art.",
  "Group H: La Furia or Los Charrúas?":
    "Style wins admiration. Survival wins trophies.",
  "Group J: World champions or Desert Warriors?":
    "Champions carry pressure. Underdogs carry freedom.",
  "Group L: Three Lions or Vatreni — who survives?":
    "These teams have produced enough drama to deserve their own Netflix series.",

  // Fashion
  "Which is harder to pull off?":
    "One wrong shade and you're boring. One wrong pattern and you're a sofa.",
  "Which completes an outfit?":
    "Accessories are just personality traits you can wear.",
  "Which actually looks better?":
    "Fashion changes its answer to this every five years.",
  "Which is the real flex?":
    "Anybody can buy expensive. Not everybody can find cool.",
  "Which era had the best style?":
    "The 90s imagined the future. Y2K dressed for it.",
  "Which money-vibe is actually cooler?":
    "Quiet luxury says 'if you know, you know.' Logo flex says 'just in case you don't.'",
  "Which is the bigger style crime?":
    "Fashion mocked both. Then fashion became both.",
  "Which ages better over 10 years?": "Trends age. Proportions survive.",
  "Which ruined style more?":
    "One sells trends. The other makes them expire.",
  "Which wins on Sunday?":
    "At a certain age, comfort starts winning by knockout.",

  // Tech
  "Which will matter more in 10 years?":
    "One wants to upgrade your brain. The other wants to upgrade reality.",
  "Which is the real game changer?":
    "One changed what we drive. The other wants to remove the driver.",
  "Which changed communication more?":
    "One put the internet in your pocket. The other never let you leave it.",
  "Which is more overrated?":
    "Few things have generated more hype per practical use.",
  "Which platform do you actually prefer?":
    "People defend phone ecosystems like medieval kingdoms.",
  "There's only one right answer here…":
    "This isn't a setting. It's a personality test.",
  "Which camp are you in?":
    "Both camps agree on one thing: the other camp is wrong.",
  "Which is actually smarter to buy?":
    "The smartest purchase rarely gets the biggest YouTube review.",
  "Which do you trust more with your data?":
    "Modern privacy often means choosing your favourite giant corporation.",
  "Which destroyed productivity more?":
    "One steals minutes. The other steals entire evenings.",

  // Design
  "Which resonates more with users?":
    "One removed all the texture. The other added too much of it.",
  "Which communicates faster?": "Icons are universal until they're not.",
  "Which tool wins for UI design?":
    "Designers spend years arguing about tools and minutes talking about users.",
  "Which approach produces better work?":
    "One asks 'what can we remove?' The other asks 'why stop now?'",
  "Which is the harder skill to master?":
    "Bad colours are obvious. Bad typography is everywhere.",
  "Which era produced better graphic design?":
    "Half of today's trends are just these decades returning in disguise.",
  "Which matters more in a logo?":
    "Simple is forgettable. Memorable is complicated. Good luck.",
  "Which screen is actually better for design work?":
    "Every designer believes their monitor setup is a competitive advantage.",
  "Which is more essential?":
    "One creates structure. The other prevents visual suffocation.",
  "Which takes more talent?":
    "One draws the picture. The other designs the experience.",

  // Food
  "Which deserves more respect as a cuisine?":
    "One serves masterpieces. The other serves memories.",
  "Which brunch pick says more about you?":
    "Avocado toast has plans after brunch. Full English does not.",
  "Which is actually the superior fruit?":
    "One tastes like sunshine. The other owns dessert.",
  "Which method wins in the kitchen?":
    "One rewards fire. The other rewards patience.",
  "Which is the better late-night decision?":
    "Nobody has ever regretted either choice before taking the first bite.",
  "The eternal debate — which side are you on?":
    "Civilization has solved harder problems than this. Apparently not this one.",
  "Which caffeine culture is superior?":
    "You're voting on a lifestyle disguised as a coffee preference.",
  "Which is the better comfort food?":
    "Both have rescued terrible days around the world.",
  "Which is the better guilty pleasure?":
    "One disappears because you want more. The other because you deserve more.",
  "Which breakfast actually sets up your day?":
    "People haven't even had coffee yet and we're starting arguments.",

  // Travel
  "Which is the superior travel pick?":
    "Window people want photos. Aisle people want freedom.",
  "Which recharges you more?":
    "Some recharge by doing nothing. Others by climbing things.",
  "Which trip leaves better memories?":
    "One teaches independence. The other creates stories.",
  "Which is the better way to experience a city?":
    "One sells authenticity. The other sells convenience.",
  "Which destination is actually more beautiful?":
    "One feels like tomorrow. The other feels timeless.",
  "Which makes for a better story?":
    "Adventure stories rarely begin with room service.",
  "Which continent has better food culture?":
    "This debate could start an international incident.",
  "Which ruins the vibe more?":
    "One crowds the destination. The other ruins the weather app.",
  "Which is the smarter way to travel?":
    "Some travellers pack spreadsheets. Others pack optimism.",
  "Which city has better nightlife?":
    "One parties until sunrise. The other occasionally ignores sunrise.",

  // Other
  "Which makes you happier long-term?":
    "People spend years trading one for the other.",
  "The superior pet — settle it.":
    "Dogs think you're amazing. Cats think they're amazing.",
  "Which social media era was better?":
    "Instagram made everyone a photographer. TikTok made everyone a broadcaster.",
  "Which is the smarter financial move at 25?":
    "One buys stability. The other buys possibility.",
  "Which actually gets more done?":
    "Morning people write productivity books. Night owls read them at 2 AM.",
  "Which is more important in a partner?":
    "Dating apps start with looks. Relationships don't survive on them.",
  "Which streaming giant is actually winning?":
    "Netflix helps you choose. YouTube chooses for you.",
  "Which is the bigger life skill?":
    "One gets you places. The other feeds you when you get there.",
  "Which matters more for success?":
    "Talent gets the headlines. Hard work gets the results.",
  "Which is the better way to spend a Sunday?":
    "One creates memories. The other asks if you're still watching.",
};

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars in .env.local");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let updated = 0;
  const unmatched: string[] = [];

  for (const [title, comment] of Object.entries(COMMENTS)) {
    const { data, error } = await supabase
      .from("polls")
      .update({ comment })
      .eq("title", title)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) {
      unmatched.push(title);
    } else {
      updated += data.length;
    }
  }

  console.log(`Updated ${updated} poll(s) with comments.`);
  if (unmatched.length > 0) {
    console.log(`\nNo title match for ${unmatched.length}:`);
    unmatched.forEach((t) => console.log(`  - ${t}`));
  }
}

main().catch((error) => {
  console.error("Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
