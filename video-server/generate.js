const { createCanvas, loadImage, registerFont } = require('canvas');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', { family: 'DejaVu Sans', weight: 'bold' });
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', { family: 'DejaVu Sans' });
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf', { family: 'DejaVu Sans', style: 'italic' });
} catch (e) {
  console.warn('Font registration failed:', e.message);
}

const WIDTH = 720;
const HEIGHT = 1280;
const FPS = 25;
const DURATION = 9; // seconds

// ── Helpers ─────────────────────────────────────────────────────────────────

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function pathRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFlagImage(ctx, img, x, y, w, h) {
  const imgAspect = img.width / img.height;
  const containerAspect = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgAspect > containerAspect) {
    sw = img.height * containerAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / containerAspect;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ── Layout pre-computation ───────────────────────────────────────────────────

function computeLayout(poll) {
  const tmpCanvas = createCanvas(WIDTH, HEIGHT);
  const ctx = tmpCanvas.getContext('2d');

  const PAD = 32;
  const flagW = WIDTH - PAD * 2;
  const flagH = 310;   // taller flags — more square ratio
  const vsR = 46;      // VS circle radius — overlaps both flags

  // Top section: badge + title + subtitle
  let topY = 52;
  topY += 36; // badge height+gap (tighter than before)

  ctx.font = 'bold 44px "DejaVu Sans"';
  const titleLines = wrapText(ctx, poll.title || '', flagW).slice(0, 3);
  topY += titleLines.length * 54 + 10;
  topY += 36; // subtitle
  const topEnd = topY;

  // Bottom section: comment + CTA
  const ctaBtnH = 54;
  const ctaBottom = HEIGHT - 48;
  const ctaTop = ctaBottom - ctaBtnH;

  ctx.font = 'italic 18px "DejaVu Sans"';
  const commentMaxW = flagW - 4 - 32; // border + padding
  let commentLines = [];
  if (poll.comment) {
    commentLines = wrapText(ctx, `"${poll.comment}"`, commentMaxW).slice(0, 2);
  }
  const commentLineH = 30;
  const commentPadV = 18;
  const commentBlockH = commentLines.length > 0 ? commentLines.length * commentLineH + commentPadV * 2 : 0;
  const commentTop = commentLines.length > 0 ? ctaTop - 18 - commentBlockH : ctaTop;
  const bottomStart = commentLines.length > 0 ? commentTop : ctaTop;

  // Flags: centered between topEnd and bottomStart
  // VS circle sits at the seam of the two flags, overlapping both
  const availH = bottomStart - topEnd;
  const flagsH = flagH * 2; // no gap — VS overlaps
  const flagsStartY = topEnd + Math.floor((availH - flagsH) / 2);

  return {
    PAD, flagW, flagH, vsR,
    titleLines, commentLines,
    topEnd, flagsStartY,
    commentTop, commentBlockH, commentLineH, commentPadV,
    ctaTop, ctaBtnH
  };
}

// ── Draw one frame onto existing ctx ────────────────────────────────────────

// Animation timeline (seconds)
const T = {
  badgeFade:    [0.15, 0.55],
  titleType:    [0.55, 1.80],
  subtitleFade: [1.80, 2.20],
  flagA:        [2.20, 3.00],
  flagB:        [3.00, 3.80],
  vsCircle:     [3.80, 4.20],
  commentType:  [4.40, 5.70],
  ctaFade:      [5.90, 6.40],
  fadeOut:      [8.20, 9.00],
};

function renderFrame(ctx, poll, imgA, imgB, t, layout) {
  const {
    PAD, flagW, flagH, vsR,
    titleLines, commentLines,
    topEnd, flagsStartY,
    commentTop, commentBlockH, commentLineH, commentPadV,
    ctaTop, ctaBtnH
  } = layout;

  const isFifa = poll.category === 'FIFA 2026';
  const badgeColor = isFifa ? '#22c55e' : '#a78bfa';

  // ── Background ──
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  let y = 52;

  // ── Category badge ──
  const badgeA = easeOut(prog(t, T.badgeFade[0], T.badgeFade[1]));
  if (badgeA > 0 && poll.category) {
    const catLabel = poll.category.toUpperCase();
    ctx.globalAlpha = badgeA;
    ctx.font = 'bold 14px "DejaVu Sans"';
    const tw = ctx.measureText(catLabel).width;
    const bw = tw + 26; const bh = 28;
    ctx.fillStyle = isFifa ? 'rgba(34,197,94,0.15)' : 'rgba(167,139,250,0.15)';
    pathRoundRect(ctx, PAD, y - bh / 2, bw, bh, 14);
    ctx.fill();
    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(catLabel, PAD + 13, y);
  }
  y += 36;

  // ── Title — typewriter ──
  const titleProg = prog(t, T.titleType[0], T.titleType[1]);
  if (titleProg > 0) {
    ctx.globalAlpha = 1;
    ctx.font = 'bold 44px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const totalChars = titleLines.reduce((s, l) => s + l.length, 0);
    let remaining = Math.floor(titleProg * totalChars);
    titleLines.forEach((line, i) => {
      if (remaining <= 0) return;
      ctx.fillText(line.slice(0, remaining), PAD, y + i * 54);
      remaining -= line.length;
    });
  }
  y += titleLines.length * 54 + 10;

  // ── Subtitle ──
  const subA = easeOut(prog(t, T.subtitleFade[0], T.subtitleFade[1]));
  if (subA > 0) {
    ctx.globalAlpha = subA;
    ctx.font = 'italic 18px "DejaVu Sans"';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText("Vote to reveal the internet's choice.", PAD, y);
  }

  // ── Flag A ──
  const flagAA = easeOut(prog(t, T.flagA[0], T.flagA[1]));
  if (flagAA > 0) {
    ctx.globalAlpha = flagAA;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    pathRoundRect(ctx, PAD, flagsStartY, flagW, flagH, 14);
    ctx.fill();
    if (imgA) {
      ctx.save();
      pathRoundRect(ctx, PAD, flagsStartY, flagW, flagH, 14);
      ctx.clip();
      drawFlagImage(ctx, imgA, PAD, flagsStartY, flagW, flagH);
      ctx.restore();
    }
    if (poll.option_a_label) {
      const lh = 46;
      ctx.fillStyle = 'rgba(0,0,0,0.68)';
      ctx.fillRect(PAD, flagsStartY + flagH - lh, flagW, lh);
      ctx.font = 'bold 21px "DejaVu Sans"';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(poll.option_a_label, PAD + 14, flagsStartY + flagH - lh / 2);
    }
  }

  // ── Flag B ──
  const flagBY = flagsStartY + flagH;
  const flagBA = easeOut(prog(t, T.flagB[0], T.flagB[1]));
  if (flagBA > 0) {
    ctx.globalAlpha = flagBA;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    pathRoundRect(ctx, PAD, flagBY, flagW, flagH, 14);
    ctx.fill();
    if (imgB) {
      ctx.save();
      pathRoundRect(ctx, PAD, flagBY, flagW, flagH, 14);
      ctx.clip();
      drawFlagImage(ctx, imgB, PAD, flagBY, flagW, flagH);
      ctx.restore();
    }
    if (poll.option_b_label) {
      const lh = 46;
      ctx.fillStyle = 'rgba(0,0,0,0.68)';
      ctx.fillRect(PAD, flagBY + flagH - lh, flagW, lh);
      ctx.font = 'bold 21px "DejaVu Sans"';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(poll.option_b_label, PAD + 14, flagBY + flagH - lh / 2);
    }
  }

  // ── VS circle — overlaps both flags at their seam, pops in with scale ──
  const vsRawP = prog(t, T.vsCircle[0], T.vsCircle[1]);
  if (vsRawP > 0) {
    const vsCX = WIDTH / 2;
    const vsCY = flagsStartY + flagH; // seam between flags
    const scale = easeOut(vsRawP);

    ctx.globalAlpha = scale;
    ctx.save();
    ctx.translate(vsCX, vsCY);
    ctx.scale(scale, scale);

    // Dark ring for definition against flags
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(0, 0, vsR + 5, 0, Math.PI * 2);
    ctx.fill();

    // Purple fill
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.arc(0, 0, vsR, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 22px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VS', 0, 0);

    ctx.restore();
  }

  // ── Comment — green left border, typewriter ──
  const commentProg = prog(t, T.commentType[0], T.commentType[1]);
  if (commentLines.length > 0 && commentProg > 0) {
    const borderW = 4;
    const padH = 16;

    ctx.globalAlpha = Math.min(1, commentProg * 4); // background fades in fast
    ctx.fillStyle = 'rgba(34,197,94,0.08)';
    pathRoundRect(ctx, PAD, commentTop, flagW, commentBlockH, 8);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    pathRoundRect(ctx, PAD, commentTop, borderW, commentBlockH, 2);
    ctx.fill();

    // Typewriter text
    ctx.globalAlpha = 1;
    ctx.font = 'italic 18px "DejaVu Sans"';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const totalChars = commentLines.reduce((s, l) => s + l.length, 0);
    let remaining = Math.floor(commentProg * totalChars);
    commentLines.forEach((line, i) => {
      if (remaining <= 0) return;
      ctx.fillText(line.slice(0, remaining), PAD + borderW + padH,
        commentTop + commentPadV + commentLineH * i + commentLineH / 2);
      remaining -= line.length;
    });
  }

  // ── CTA button — reddish ──
  const ctaA = easeOut(prog(t, T.ctaFade[0], T.ctaFade[1]));
  if (ctaA > 0) {
    ctx.globalAlpha = ctaA;
    ctx.fillStyle = '#ef4444';
    pathRoundRect(ctx, PAD, ctaTop, flagW, ctaBtnH, 27);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VOTE NOW → flipkliq.com', WIDTH / 2, ctaTop + ctaBtnH / 2);
  }

  // ── Global fade out ──
  const fadeOut = prog(t, T.fadeOut[0], T.fadeOut[1]);
  if (fadeOut > 0) {
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  ctx.globalAlpha = 1;
}

// ── Main export ──────────────────────────────────────────────────────────────

async function generateVideo(poll) {
  const tmpDir = fs.mkdtempSync('/tmp/reel-');
  const videoPath = path.join(tmpDir, 'reel.mp4');

  try {
    console.log(`[generate] Pre-loading flag images...`);
    let imgA = null, imgB = null;
    try { imgA = await loadImage(poll.option_a_image); } catch (e) { console.warn('imgA load failed:', e.message); }
    try { imgB = await loadImage(poll.option_b_image); } catch (e) { console.warn('imgB load failed:', e.message); }

    console.log(`[generate] Computing layout...`);
    const layout = computeLayout(poll);

    // Single canvas reused across all frames to keep RAM low
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const totalFrames = FPS * DURATION;
    console.log(`[generate] Rendering ${totalFrames} frames...`);

    for (let f = 0; f < totalFrames; f++) {
      const t = f / FPS;
      renderFrame(ctx, poll, imgA, imgB, t, layout);
      const buf = canvas.toBuffer('image/jpeg', { quality: 0.90 });
      fs.writeFileSync(path.join(tmpDir, `frame${String(f).padStart(4, '0')}.jpg`), buf);
    }

    console.log(`[generate] Running FFmpeg...`);
    execSync(
      `ffmpeg -y -framerate ${FPS} -i "${tmpDir}/frame%04d.jpg" ` +
      `-c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p "${videoPath}"`,
      { stdio: 'pipe' }
    );

    console.log(`[generate] Uploading to Supabase Storage...`);
    const ws = require('ws');
    const fetch = require('node-fetch');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws }, global: { fetch } }
    );

    const fileName = `reel-${poll.id}-${Date.now()}.mp4`;
    const videoBuffer = fs.readFileSync(videoPath);

    const { error: uploadError } = await supabase.storage
      .from('reels')
      .upload(fileName, videoBuffer, { contentType: 'video/mp4', upsert: true });

    if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('reels')
      .getPublicUrl(fileName);

    console.log(`[generate] Done: ${publicUrl}`);
    return { videoUrl: publicUrl, fileName };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { generateVideo };
