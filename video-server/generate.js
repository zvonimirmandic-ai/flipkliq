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

  const PAD = 28;
  const flagW = WIDTH - PAD * 2;
  const flagH = 270;

  // Background — match website dark navy
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  let y = 44;

  // Brand
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText('FLIPKLIQ', WIDTH / 2, y);
  y += 38;

  // Category badge (green for FIFA, purple for others)
  const isFifa = poll.category === 'FIFA 2026';
  const badgeColor = isFifa ? '#22c55e' : '#a78bfa';
  const catLabel = poll.category ? poll.category.toUpperCase() : '';
  if (catLabel) {
    ctx.font = 'bold 15px "DejaVu Sans"';
    const tw = ctx.measureText(catLabel).width;
    const bw = tw + 24; const bh = 26;
    ctx.fillStyle = isFifa ? 'rgba(34,197,94,0.12)' : 'rgba(167,139,250,0.12)';
    pathRoundRect(ctx, PAD, y - bh / 2, bw, bh, 13);
    ctx.fill();
    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'left';
    ctx.fillText(catLabel, PAD + 12, y);
    y += 38;
  }

  // Poll title — left aligned, large bold
  ctx.textAlign = 'left';
  ctx.font = 'bold 46px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  const titleLines = wrapText(ctx, poll.title || '', WIDTH - PAD * 2);
  titleLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, PAD, y + i * 56);
  });
  y += titleLines.slice(0, 3).length * 56 + 14;

  // Subtitle
  ctx.textAlign = 'left';
  ctx.font = 'italic 19px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillText("Vote to reveal the internet's choice.", PAD, y);
  y += 34;

  // Flag A
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  pathRoundRect(ctx, PAD, y, flagW, flagH, 12);
  ctx.fill();
  try {
    const imgA = await loadImage(poll.option_a_image);
    ctx.save();
    pathRoundRect(ctx, PAD, y, flagW, flagH, 12);
    ctx.clip();
    drawFlagImage(ctx, imgA, PAD, y, flagW, flagH);
    ctx.restore();
  } catch { /* placeholder */ }

  // Label overlay flag A
  if (poll.option_a_label) {
    const lh = 40;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(PAD, y + flagH - lh, flagW, lh);
    ctx.font = 'bold 20px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(poll.option_a_label, PAD + 14, y + flagH - lh / 2);
  }
  y += flagH + 12;

  // VS divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, y + 13); ctx.lineTo(WIDTH / 2 - 22, y + 13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(WIDTH / 2 + 22, y + 13); ctx.lineTo(WIDTH - PAD, y + 13); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('VS', WIDTH / 2, y + 13);
  y += 30;

  // Flag B
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  pathRoundRect(ctx, PAD, y, flagW, flagH, 12);
  ctx.fill();
  try {
    const imgB = await loadImage(poll.option_b_image);
    ctx.save();
    pathRoundRect(ctx, PAD, y, flagW, flagH, 12);
    ctx.clip();
    drawFlagImage(ctx, imgB, PAD, y, flagW, flagH);
    ctx.restore();
  } catch { /* placeholder */ }

  // Label overlay flag B
  if (poll.option_b_label) {
    const lh = 40;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(PAD, y + flagH - lh, flagW, lh);
    ctx.font = 'bold 20px "DejaVu Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(poll.option_b_label, PAD + 14, y + flagH - lh / 2);
  }
  y += flagH + 18;

  // Comment
  if (poll.comment) {
    ctx.textAlign = 'left';
    ctx.font = 'italic 19px "DejaVu Sans"';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    const cLines = wrapText(ctx, `"${poll.comment}"`, WIDTH - PAD * 2);
    cLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, PAD, y + i * 28);
    });
    y += cLines.slice(0, 2).length * 28 + 12;
  }

  // CTA — pinned near bottom
  const ctaY = HEIGHT - 52;
  ctx.fillStyle = '#7c3aed';
  pathRoundRect(ctx, PAD, ctaY - 24, WIDTH - PAD * 2, 48, 24);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VOTE NOW → flipkliq.com', WIDTH / 2, ctaY);

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
