// Turn a 2-letter ISO country code into its flag emoji (regional indicators).
export function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) {
    return "🏳️";
  }
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

// "HR" -> "Croatia". Falls back to the raw code for unknown/invalid codes.
export function getCountryName(code: string): string {
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
