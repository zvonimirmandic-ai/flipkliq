export type PollStatus = "draft" | "active" | "archived";

export type Poll = {
  id: string;
  title: string;
  option_a_image: string;
  option_b_image: string;
  option_a_label: string | null;
  option_b_label: string | null;
  category: string | null;
  group: string | null;
  status: PollStatus;
  created_at: string;
  closes_at: string | null;
  comment: string | null;
};

export type CountryStat = {
  country_code: string;
  votes_a: number;
  votes_b: number;
  total: number;
  preferred: "a" | "b" | "tie";
};

export type PollWithVotes = Poll & {
  votes_a: number;
  votes_b: number;
  top_countries?: CountryStat[];
};

export const POLL_CATEGORIES = [
  "FIFA 2026",
  "Fashion",
  "Tech",
  "Design",
  "Food",
  "Travel",
  "Other",
] as const;
