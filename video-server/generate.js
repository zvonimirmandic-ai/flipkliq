const { createCanvas, loadImage, registerFont } = require('canvas');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Register DejaVu fonts (installed via apt in Dockerfile)
try {
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', { family: 'DejaVu Sans', weight: 'bold' });
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', { family: 'DejaVu Sans' });
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf', { family: 'DejaVu Sans', style: 'italic' });
} catch (e) {
  console.warn('Font registration failed, using system defaults:', e.message);
}

const WIDTH = 720;
const HEIGHT = 1280;
const FPS = 25;
const DURATION = 8;

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

async function drawFrame(poll) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'middle';

  const PAD = 32;

  // ── BACKGROUND — dark navy matching website ──
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── TOP SECTION ──
  let y = 56;

  // Category badge
  const isFifa = poll.category === 'FIFA 2026';
  const badgeColor = isFifa ? '#22c55e' : '#a78bfa';
  const catLabel = poll.category ? poll.category.toUpperCase() : '';
  if (catLabel) {
    ctx.font = 'bold 14px "DejaVu Sans"';
    const tw = ctx.measureText(catLabel).width;
    const bw = tw + 26;
    const bh = 30;
    ctx.fillStyle = isFifa ? 'rgba(34,197,94,0.15)' : 'rgba(167,139,250,0.15)';
    pathRoundRect(ctx, PAD, y - bh / 2, bw, bh, 15);
    ctx.fill();
    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'left';
    ctx.fillText(catLabel, PAD + 13, y);
    y += 48;
  }

  // Poll title — left aligned, large bold
  ctx.textAlign = 'left';
  ctx.font = 'bold 44px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  const titleLines = wrapText(ctx, poll.title || '', WIDTH - PAD * 2);
  titleLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, PAD, y + i * 54);
  });
  y += titleLines.slice(0, 3).length * 54 + 14;

  // Subtitle
  ctx.font = 'italic 18px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.textAlign = 'left';
  ctx.fillText("Vote to reveal the internet's choice.", PAD, y);
  y += 38;

  const topEnd = y;

  // ── BOTTOM SECTION (anchor from bottom up) ──
  const ctaBtnH = 54;
  const ctaMarginBottom = 50;
  const ctaTop = HEIGHT - ctaMarginBottom - ctaBtnH;
  const ctaMidY = ctaTop + ctaBtnH / 2;

  // Comment block
  const commentPadV = 18;
  const commentPadH = 16;
  const commentLineH = 30;
  const commentBorderW = 4;
  let commentLines = [];
  if (poll.comment) {
    ctx.font = 'italic 18px "DejaVu Sans"';
    commentLines = wrapText(ctx, `"${poll.comment}"`, WIDTH - PAD * 2 - commentBorderW - commentPadH * 2).slice(0, 2);
  }
  const commentBlockH = commentLines.length > 0 ? commentLines.length * commentLineH + commentPadV * 2 : 0;
  const commentGap = 20;
  const commentTop = commentLines.length > 0 ? ctaTop - commentGap - commentBlockH : ctaTop;

  // ── FLAGS SECTION — centered between top content and bottom content ──
  const flagAreaH = commentTop - topEnd;
  const vsD = 60; // VS circle diameter
  const flagGap = 0; // flags touch the circle
  const flagH = Math.min(250, Math.floor((flagAreaH - vsD - flagGap * 2 - 20) / 2));
  const flagsTotal = flagH + vsD + flagH;
  const flagStartY = topEnd + Math.floor((flagAreaH - flagsTotal) / 2);
  const flagW = WIDTH - PAD * 2;

  // Flag A
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  pathRoundRect(ctx, PAD, flagStartY, flagW, flagH, 14);
  ctx.fill();
  try {
    const imgA = await loadImage(poll.option_a_image);
    ctx.save();
    pathRoundRect(ctx, PAD, flagStartY, flagW, flagH, 14);
    ctx.clip();
    drawFlagImage(ctx, imgA, PAD, flagStartY, flagW, flagH);
    ctx.restore();
  } catch { /* placeholder */ }
  if (poll.option_a_label) {
    const lh = 44;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(PAD, flagStartY + flagH - lh, flagW, lh);
    ctx.font = 'bold 21px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(poll.option_a_label, PAD + 14, flagStartY + flagH - lh / 2);
  }

  // VS circle (purple, centered between flags)
  const vsY = flagStartY + flagH + vsD / 2;
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.arc(WIDTH / 2, vsY, vsD / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = 'bold 19px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VS', WIDTH / 2, vsY);

  // Flag B
  const flagBY = flagStartY + flagH + vsD;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  pathRoundRect(ctx, PAD, flagBY, flagW, flagH, 14);
  ctx.fill();
  try {
    const imgB = await loadImage(poll.option_b_image);
    ctx.save();
    pathRoundRect(ctx, PAD, flagBY, flagW, flagH, 14);
    ctx.clip();
    drawFlagImage(ctx, imgB, PAD, flagBY, flagW, flagH);
    ctx.restore();
  } catch { /* placeholder */ }
  if (poll.option_b_label) {
    const lh = 44;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(PAD, flagBY + flagH - lh, flagW, lh);
    ctx.font = 'bold 21px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(poll.option_b_label, PAD + 14, flagBY + flagH - lh / 2);
  }

  // ── COMMENT — green left border, italic, like website ──
  if (commentLines.length > 0) {
    // Subtle green-tinted background
    ctx.fillStyle = 'rgba(34,197,94,0.07)';
    pathRoundRect(ctx, PAD, commentTop, WIDTH - PAD * 2, commentBlockH, 8);
    ctx.fill();
    // Green left border bar
    ctx.fillStyle = '#22c55e';
    pathRoundRect(ctx, PAD, commentTop, commentBorderW, commentBlockH, 2);
    ctx.fill();
    // Comment text
    ctx.font = 'italic 18px "DejaVu Sans"';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.textAlign = 'left';
    commentLines.forEach((line, i) => {
      ctx.fillText(line, PAD + commentBorderW + commentPadH, commentTop + commentPadV + commentLineH * i + commentLineH / 2);
    });
  }

  // ── CTA BUTTON — reddish ──
  ctx.fillStyle = '#ef4444';
  pathRoundRect(ctx, PAD, ctaTop, WIDTH - PAD * 2, ctaBtnH, 27);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VOTE NOW → flipkliq.com', WIDTH / 2, ctaMidY);

  return canvas.toBuffer('image/jpeg', { quality: 0.92 });
}

async function generateVideo(poll) {
  const tmpDir = fs.mkdtempSync('/tmp/reel-');
  const framePath = path.join(tmpDir, 'frame.jpg');
  const videoPath = path.join(tmpDir, 'reel.mp4');

  try {
    console.log(`[generate] Drawing frame for poll ${poll.id}...`);
    const frameBuffer = await drawFrame(poll);
    fs.writeFileSync(framePath, frameBuffer);

    console.log(`[generate] Running FFmpeg...`);
    const fadeFrames = Math.round(FPS * 0.5);
    const totalFrames = FPS * DURATION;
    const fadeOutStart = totalFrames - fadeFrames;
    execSync(
      `ffmpeg -y -loop 1 -i "${framePath}" ` +
      `-vf "fade=in:0:${fadeFrames},fade=out:${fadeOutStart}:${fadeFrames}" ` +
      `-t ${DURATION} -pix_fmt yuv420p -c:v libx264 -preset ultrafast -crf 28 "${videoPath}"`,
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
