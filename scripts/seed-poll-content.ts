/**
 * Rebuilds all poll content in Supabase.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-poll-content.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * For each non-FIFA category: deletes existing polls then inserts the 10 below,
 * using branded placeholder images (the `query` fields are retained for
 * reference if real images are sourced later). FIFA 2026 polls are updated in
 * place (text + created_at), keeping their flag images. Every poll ends up
 * status='active'.
 *
 * Idempotent / resumable: a category whose titles already match is skipped.
 * Note: Fashion and Tech were already seeded with real Unsplash/Cloudinary
 * images and will be skipped here, keeping those images.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

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

type Option = { label: string; query: string };
type Poll = { title: string; a: Option; b: Option };

const o = (label: string, query: string): Option => ({ label, query });

// ---------------------------------------------------------------------------
// Non-FIFA poll content. `query` is the Unsplash search term for that option.
// ---------------------------------------------------------------------------
const CATEGORIES: Record<string, Poll[]> = {
  Fashion: [
    { title: "Which era had the best style?", a: o("90s", "1990s fashion style"), b: o("Y2K", "y2k fashion aesthetic") },
    { title: "Which money-vibe is actually cooler?", a: o("Quiet luxury", "quiet luxury fashion neutral beige"), b: o("Logo flex", "designer logo streetwear") },
    { title: "Which is the bigger style crime?", a: o("Socks & sandals", "socks and sandals feet"), b: o("Crocs", "crocs shoes") },
    { title: "Which ages better over 10 years?", a: o("Streetwear", "streetwear outfit"), b: o("Tailored fits", "tailored suit menswear") },
    { title: "Which is the real flex?", a: o("Vintage thrift find", "vintage thrift clothing rack"), b: o("Fresh new drop", "new sneakers box") },
    { title: "Which actually looks better?", a: o("Oversized", "oversized clothing fashion"), b: o("Fitted", "fitted tailored outfit") },
    { title: "Which ruined style more?", a: o("Fast fashion", "fast fashion clothing store"), b: o("Influencer culture", "fashion influencer phone camera") },
    { title: "Which wins on Sunday?", a: o("Comfort", "cozy comfortable loungewear"), b: o("Style", "stylish fashion outfit") },
    { title: "Which is harder to pull off?", a: o("Monochrome", "monochrome all black outfit"), b: o("Pattern mixing", "pattern mixing colorful outfit") },
    { title: "Which completes an outfit?", a: o("Sunglasses", "sunglasses fashion accessory"), b: o("Watch", "wristwatch luxury") },
  ],
  Tech: [
    { title: "Which camp are you in?", a: o("Mac", "macbook apple laptop"), b: o("PC", "desktop pc computer setup") },
    { title: "Which is actually smarter to buy?", a: o("Flagship phone", "flagship smartphone premium"), b: o("Mid-range", "budget smartphone") },
    { title: "Which do you trust more with your data?", a: o("Google", "google office logo"), b: o("Apple", "apple store logo") },
    { title: "Which will matter more in 10 years?", a: o("AI", "artificial intelligence robot"), b: o("VR", "vr headset virtual reality") },
    { title: "Which destroyed productivity more?", a: o("Social media", "social media apps phone"), b: o("Streaming", "streaming tv screen") },
    { title: "There's only one right answer here…", a: o("Dark mode", "dark mode screen interface"), b: o("Light mode", "bright white screen interface") },
    { title: "Which platform do you actually prefer?", a: o("iOS", "iphone ios screen"), b: o("Android", "android phone screen") },
    { title: "Which is more overrated?", a: o("Metaverse", "metaverse virtual world"), b: o("NFTs", "nft digital art crypto") },
    { title: "Which changed communication more?", a: o("Smartphones", "smartphone in hand"), b: o("Social media", "social media feed phone") },
    { title: "Which is the real game changer?", a: o("Electric cars", "electric car charging"), b: o("Self-driving", "self driving autonomous car") },
  ],
  Design: [
    { title: "Which approach produces better work?", a: o("Minimalism", "minimalist design white"), b: o("Maximalism", "maximalist colorful design") },
    { title: "Which is the harder skill to master?", a: o("Typography", "typography poster design"), b: o("Color theory", "color palette swatches") },
    { title: "Which era produced better graphic design?", a: o("80s", "1980s retro neon design"), b: o("90s", "1990s graphic design") },
    { title: "Which matters more in a logo?", a: o("Simplicity", "simple minimal logo"), b: o("Memorability", "bold memorable logo design") },
    { title: "Which screen is actually better for design work?", a: o("Ultra-wide", "ultrawide monitor desk"), b: o("Dual monitors", "dual monitor workstation") },
    { title: "Which is more essential?", a: o("Grid systems", "grid layout design"), b: o("White space", "white space minimal layout") },
    { title: "Which resonates more with users?", a: o("Flat design", "flat design illustration"), b: o("Skeuomorphism", "realistic 3d icon design") },
    { title: "Which takes more talent?", a: o("Illustration", "digital illustration artist"), b: o("UX design", "ux design wireframe") },
    { title: "Which communicates faster?", a: o("Icons", "icon set design"), b: o("Text labels", "typography text labels") },
    { title: "Which tool wins for UI design?", a: o("Figma", "ui design software interface"), b: o("Sketch", "design app sketching screen") },
  ],
  Food: [
    { title: "The eternal debate — which side are you on?", a: o("Pizza", "pizza"), b: o("Burger", "burger") },
    { title: "Which breakfast actually sets up your day?", a: o("Sweet", "sweet breakfast pancakes"), b: o("Savory", "savory breakfast eggs bacon") },
    { title: "Which caffeine culture is superior?", a: o("Espresso", "espresso coffee shot"), b: o("Filter coffee", "pour over filter coffee") },
    { title: "Which is the better comfort food?", a: o("Pasta", "italian pasta dish"), b: o("Ramen", "ramen noodles bowl") },
    { title: "Which deserves more respect as a cuisine?", a: o("Street food", "street food market"), b: o("Fine dining", "fine dining plated dish") },
    { title: "Which is the better guilty pleasure?", a: o("Chips", "potato chips snack"), b: o("Chocolate", "chocolate bar") },
    { title: "Which brunch pick says more about you?", a: o("Avocado toast", "avocado toast brunch"), b: o("Full English", "full english breakfast") },
    { title: "Which is actually the superior fruit?", a: o("Mango", "mango fruit"), b: o("Strawberry", "strawberry fruit") },
    { title: "Which method wins in the kitchen?", a: o("Grilling", "grilling barbecue"), b: o("Slow cooking", "slow cooked stew pot") },
    { title: "Which is the better late-night decision?", a: o("Kebab", "doner kebab"), b: o("Pizza slice", "pizza slice") },
  ],
  Travel: [
    { title: "Which recharges you more?", a: o("Beach", "tropical beach"), b: o("Mountains", "mountains landscape") },
    { title: "Which trip leaves better memories?", a: o("Solo travel", "solo traveler backpack"), b: o("Group travel", "group of friends traveling") },
    { title: "Which is the better way to experience a city?", a: o("Airbnb", "cozy apartment interior"), b: o("Hotel", "luxury hotel room") },
    { title: "Which destination is actually more beautiful?", a: o("Tokyo", "tokyo city japan"), b: o("Paris", "paris eiffel tower") },
    { title: "Which makes for a better story?", a: o("Budget backpacking", "backpacking hostel travel"), b: o("Luxury resort", "luxury resort pool") },
    { title: "Which is the superior travel pick?", a: o("Aisle seat", "airplane aisle cabin"), b: o("Window seat", "airplane window seat view") },
    { title: "Which continent has better food culture?", a: o("Asia", "asian street food"), b: o("Europe", "european cuisine food") },
    { title: "Which ruins the vibe more?", a: o("Overtourism", "crowded tourist crowd"), b: o("Bad weather", "rainy weather travel") },
    { title: "Which is the smarter way to travel?", a: o("Plan everything", "travel planning map notes"), b: o("Wing it", "spontaneous road trip") },
    { title: "Which city has better nightlife?", a: o("Barcelona", "barcelona spain city"), b: o("Berlin", "berlin germany nightlife") },
  ],
  Other: [
    { title: "Which streaming giant is actually winning?", a: o("Netflix", "netflix screen tv"), b: o("YouTube", "youtube video screen") },
    { title: "Which is the bigger life skill?", a: o("Cooking", "person cooking kitchen"), b: o("Driving", "driving car steering wheel") },
    { title: "Which matters more for success?", a: o("Talent", "musician talent stage"), b: o("Hard work", "hard work effort gym") },
    { title: "Which is the better way to spend a Sunday?", a: o("Outdoors", "outdoors nature hiking"), b: o("Netflix marathon", "watching tv couch relax") },
    { title: "Which is the smarter financial move at 25?", a: o("Property", "house real estate"), b: o("Stocks", "stock market chart") },
    { title: "Which actually gets more done?", a: o("Early bird", "sunrise morning coffee"), b: o("Night owl", "night city late work") },
    { title: "Which makes you happier long-term?", a: o("Money", "money cash"), b: o("Time", "clock time") },
    { title: "Which is more important in a partner?", a: o("Looks", "portrait face beauty"), b: o("Personality", "people laughing friends") },
    { title: "The superior pet — settle it.", a: o("Dogs", "dog"), b: o("Cats", "cat") },
    { title: "Which social media era was better?", a: o("Instagram 2013", "instagram retro filter photo"), b: o("TikTok now", "tiktok phone vertical video") },
  ],
};

// ---------------------------------------------------------------------------
// FIFA 2026 — match existing rows by current label, rewrite text + created_at.
// created_at = day before the match date so the archive orders chronologically.
// ---------------------------------------------------------------------------
type FifaUpdate = {
  title: string;
  a: { label: string; current: string };
  b: { label: string; current: string };
  createdAt: string;
};

const FIFA_UPDATES: FifaUpdate[] = [
  { title: "Group A fires up — who rules the opener?", a: { label: "Mexico", current: "Mexico" }, b: { label: "South Africa", current: "South Africa" }, createdAt: "2026-06-10T12:00:00Z" },
  { title: "Group A dark horse alert — who shocks the world?", a: { label: "South Korea", current: "South Korea" }, b: { label: "Czech Republic", current: "Czech Republic" }, createdAt: "2026-06-10T12:00:00Z" },
  { title: "Group B: The host nation or the Balkan warriors?", a: { label: "Canada", current: "Canada" }, b: { label: "Bosnia & Herzegovina", current: "Bosnia and Herzegovina" }, createdAt: "2026-06-11T12:00:00Z" },
  { title: "Group D: Stars & Stripes or South American grit?", a: { label: "USA", current: "United States" }, b: { label: "Paraguay", current: "Paraguay" }, createdAt: "2026-06-11T12:00:00Z" },
  { title: "Group C: The favourites or the magic makers?", a: { label: "Brazil", current: "Brazil" }, b: { label: "Morocco", current: "Morocco" }, createdAt: "2026-06-12T12:00:00Z" },
  { title: "Group E: Old guard or rising force — who advances?", a: { label: "Germany", current: "Germany" }, b: { label: "Ivory Coast", current: "Ivory Coast" }, createdAt: "2026-06-13T12:00:00Z" },
  { title: "Group F: Total football or the Rising Sun?", a: { label: "Netherlands", current: "Netherlands" }, b: { label: "Japan", current: "Japan" }, createdAt: "2026-06-13T12:00:00Z" },
  { title: "Group H: La Furia or Los Charrúas?", a: { label: "Spain", current: "Spain" }, b: { label: "Uruguay", current: "Uruguay" }, createdAt: "2026-06-14T12:00:00Z" },
  { title: "Group J: World champions or Desert Warriors?", a: { label: "Argentina", current: "Argentina" }, b: { label: "Algeria", current: "Algeria" }, createdAt: "2026-06-15T12:00:00Z" },
  { title: "Group L: Three Lions or Vatreni — who survives?", a: { label: "England", current: "England" }, b: { label: "Croatia", current: "Croatia" }, createdAt: "2026-06-16T12:00:00Z" },
];

// ---------------------------------------------------------------------------
// Image sourcing: Unsplash search -> Cloudinary re-host. Cached per query.
// ---------------------------------------------------------------------------
const imageCache = new Map<string, string>();

async function unsplashOnce(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("UNSPLASH_ACCESS_KEY is not set in .env.local");

  // No orientation filter: the UI crops to square via object-cover, and a
  // squarish constraint makes specific phrases return empty.
  const url = `https://api.unsplash.com/search/photos?per_page=1&content_filter=high&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  });

  const remaining = res.headers.get("X-Ratelimit-Remaining");
  if (res.status === 401 || res.status === 403 || res.status === 429) {
    throw new Error(
      `Unsplash limit/auth error ${res.status} (quota left: ${remaining}). Wait for the hourly reset or check the key.`,
    );
  }
  if (!res.ok) {
    throw new Error(`Unsplash search failed (${res.status}). Quota left: ${remaining}`);
  }

  const data = (await res.json()) as { results?: { urls?: { regular?: string } }[] };
  return data.results?.[0]?.urls?.regular ?? null;
}

async function unsplashSearch(query: string): Promise<string> {
  // Try the full phrase, then progressively broader fallbacks so an overly
  // specific query never comes back empty.
  const words = query.split(/\s+/);
  const candidates = [query];
  if (words.length > 2) candidates.push(words.slice(0, 2).join(" "));
  if (words.length > 1) candidates.push(words[words.length - 1]);

  for (const q of candidates) {
    const photo = await unsplashOnce(q);
    if (photo) return photo;
  }
  throw new Error(`No Unsplash result for "${query}" or its fallbacks`);
}

async function getImage(query: string): Promise<string> {
  const cached = imageCache.get(query);
  if (cached) return cached;

  const unsplashUrl = await unsplashSearch(query);
  const result = await cloudinary.uploader.upload(unsplashUrl, {
    folder: "flipkliq/polls",
    resource_type: "image",
  });
  imageCache.set(query, result.secure_url);
  return result.secure_url;
}

// Factory so `Supabase` matches the real client generics (createClient with no
// args resolves to stricter defaults that type table rows as `never`).
function createSupabase(url: string, key: string) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
type Supabase = ReturnType<typeof createSupabase>;

async function seedCategory(supabase: Supabase, category: string, polls: Poll[]) {
  const targetTitles = new Set(polls.map((p) => p.title));

  const { data: existing, error: exErr } = await supabase
    .from("polls")
    .select("title, option_a_image, option_b_image")
    .eq("category", category);
  if (exErr) throw exErr;

  const existingTitles = new Set((existing ?? []).map((p) => p.title as string));
  const titlesMatch =
    existingTitles.size === targetTitles.size &&
    Array.from(targetTitles).every((t) => existingTitles.has(t));
  // Re-seed if any image is still a placeholder, so placeholder categories get
  // real photos while categories with real images are left alone.
  const hasPlaceholders = (existing ?? []).some(
    (p) =>
      String(p.option_a_image).includes("placehold.co") ||
      String(p.option_b_image).includes("placehold.co"),
  );

  if (titlesMatch && !hasPlaceholders) {
    console.log(`  [${category}] already up to date (real images) — skipping.`);
    return;
  }

  // Fetch every image first; only mutate the DB once all 20 succeed, so a
  // mid-run failure (e.g. Unsplash rate limit) never leaves a category empty.
  console.log(`  [${category}] fetching images…`);
  const rows = [];
  for (const poll of polls) {
    const optionAImage = await getImage(poll.a.query);
    const optionBImage = await getImage(poll.b.query);
    rows.push({
      title: poll.title,
      category,
      option_a_label: poll.a.label,
      option_b_label: poll.b.label,
      option_a_image: optionAImage,
      option_b_image: optionBImage,
      status: "active",
    });
  }

  const { error: delErr } = await supabase.from("polls").delete().eq("category", category);
  if (delErr) throw delErr;

  const { error: insErr } = await supabase.from("polls").insert(rows);
  if (insErr) throw insErr;

  console.log(`  [${category}] inserted ${rows.length} polls with real images.`);
}

async function updateFifa(supabase: Supabase) {
  const { data: existing, error } = await supabase
    .from("polls")
    .select("id, option_a_label, option_b_label")
    .eq("category", "FIFA 2026");
  if (error) throw error;

  for (const upd of FIFA_UPDATES) {
    // Match on the current OR already-updated label so re-runs stay idempotent.
    const row = (existing ?? []).find(
      (p) =>
        (p.option_a_label === upd.a.current ||
          p.option_a_label === upd.a.label) &&
        (p.option_b_label === upd.b.current ||
          p.option_b_label === upd.b.label),
    );
    if (!row) {
      console.log(`  [FIFA] no match for ${upd.a.current} vs ${upd.b.current} — skipped.`);
      continue;
    }
    const { error: updErr } = await supabase
      .from("polls")
      .update({
        title: upd.title,
        option_a_label: upd.a.label,
        option_b_label: upd.b.label,
        status: "active",
        created_at: upd.createdAt,
      })
      .eq("id", row.id);
    if (updErr) throw updErr;
    console.log(`  [FIFA] ${upd.title}`);
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars in .env.local");
  }
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    throw new Error("Missing UNSPLASH_ACCESS_KEY in .env.local");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const supabase = createSupabase(url, serviceRoleKey);

  console.log("Updating FIFA 2026 polls…");
  await updateFifa(supabase);

  console.log("Rebuilding non-FIFA categories…");
  for (const [category, polls] of Object.entries(CATEGORIES)) {
    await seedCategory(supabase, category, polls);
  }

  // Final safety: make sure everything is active for testing.
  const { error: activeErr } = await supabase
    .from("polls")
    .update({ status: "active" })
    .neq("status", "active");
  if (activeErr) throw activeErr;

  console.log("\nDone. All polls are active.");
}

main().catch((error) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  console.error("Re-run to resume — completed categories are skipped.");
  process.exit(1);
});
