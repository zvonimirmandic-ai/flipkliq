export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flipkliq.vercel.app";

export function getPollUrl(pollId: string) {
  return `${SITE_URL}/poll/${pollId}`;
}
