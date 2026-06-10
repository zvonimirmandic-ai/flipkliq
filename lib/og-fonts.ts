export type OgFonts = {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
};

async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await (await fetch(cssUrl)).text();

  // Without a browser user-agent Google Fonts serves TTF, which satori needs.
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);

  if (!match) {
    throw new Error(`Could not resolve font file for ${family} ${weight}`);
  }

  const response = await fetch(match[1]);

  if (!response.ok) {
    throw new Error(`Failed to download font for ${family} ${weight}`);
  }

  return response.arrayBuffer();
}

let fontsPromise: Promise<OgFonts> | null = null;

export function loadOgFonts(): Promise<OgFonts> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadGoogleFont("Inter", 400),
      loadGoogleFont("Inter", 700),
    ])
      .then(([regular, bold]) => ({ regular, bold }))
      .catch((error) => {
        fontsPromise = null;
        throw error;
      });
  }

  return fontsPromise;
}
