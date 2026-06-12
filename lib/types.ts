export type PollStatus = "draft" | "active" | "archived";

export type Poll = {
  id: string;
  title: string;
  option_a_image: string;
  option_b_image: string;
  option_a_label: string | null;
  option_b_label: string | null;
  category: string | null;
  status: PollStatus;
  created_at: string;
};

export type PollWithVotes = Poll & {
  votes_a: number;
  votes_b: number;
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
