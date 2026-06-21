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

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
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

async function drawFrame(poll) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle purple glow
  const grad = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, 860);
  grad.addColorStop(0, 'rgba(124,58,237,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Brand
  ctx.font = 'bold 44px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('FLIPKLIQ', WIDTH / 2, 110);

  let cursorY = 195;

  // Group badge (FIFA only)
  if (poll.group) {
    const badgeText = `GROUP ${poll.group}`;
    ctx.font = '28px "DejaVu Sans"';
    const textW = ctx.measureText(badgeText).width;
    const bw = textW + 48;
    const bh = 46;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    pathRoundRect(ctx, WIDTH / 2 - bw / 2, cursorY - bh / 2, bw, bh, 23);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(badgeText, WIDTH / 2, cursorY);
    cursorY += 76;
  }

  // Poll question
  ctx.font = 'bold 72px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  const titleLines = wrapText(ctx, poll.title || '', WIDTH - 120);
  titleLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, WIDTH / 2, cursorY + i * 88);
  });

  // Flags — vertically centered
  const flagW = 390;
  const flagH = 260;
  const flagY = HEIGHT / 2 - flagH / 2 - 30;
  const vsGap = 56;
  const leftX = WIDTH / 2 - flagW - vsGap / 2;
  const rightX = WIDTH / 2 + vsGap / 2;

  // Flag A
  try {
    const imgA = await loadImage(poll.option_a_image);
    ctx.save();
    pathRoundRect(ctx, leftX, flagY, flagW, flagH, 16);
    ctx.clip();
    ctx.drawImage(imgA, leftX, flagY, flagW, flagH);
    ctx.restore();
  } catch {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    pathRoundRect(ctx, leftX, flagY, flagW, flagH, 16);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  pathRoundRect(ctx, leftX, flagY, flagW, flagH, 16);
  ctx.stroke();

  // Flag B
  try {
    const imgB = await loadImage(poll.option_b_image);
    ctx.save();
    pathRoundRect(ctx, rightX, flagY, flagW, flagH, 16);
    ctx.clip();
    ctx.drawImage(imgB, rightX, flagY, flagW, flagH);
    ctx.restore();
  } catch {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    pathRoundRect(ctx, rightX, flagY, flagW, flagH, 16);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  pathRoundRect(ctx, rightX, flagY, flagW, flagH, 16);
  ctx.stroke();

  // VS circle
  const vsX = WIDTH / 2;
  const vsY = flagY + flagH / 2;
  ctx.fillStyle = 'rgba(10,10,10,0.88)';
  ctx.beginPath();
  ctx.arc(vsX, vsY, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = 'bold 34px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VS', vsX, vsY);

  // Team labels
  ctx.font = 'bold 40px "DejaVu Sans"';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(poll.option_a_label || 'Option A', leftX + flagW / 2, flagY + flagH + 52);
  ctx.fillText(poll.option_b_label || 'Option B', rightX + flagW / 2, flagY + flagH + 52);

  // Comment box
  if (poll.comment) {
    const cbY = HEIGHT - 340;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    pathRoundRect(ctx, 70, cbY, WIDTH - 140, 180, 20);
    ctx.fill();
    ctx.font = 'italic 40px "DejaVu Sans"';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    const cLines = wrapText(ctx, `"${poll.comment}"`, WIDTH - 180);
    cLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, WIDTH / 2, cbY + 60 + i * 56);
    });
  }

  // CTA button
  const ctaY = HEIGHT - 110;
  ctx.fillStyle = '#7c3aed';
  pathRoundRect(ctx, WIDTH / 2 - 250, ctaY - 40, 500, 80, 40);
  ctx.fill();
  ctx.font = 'bold 34px "DejaVu Sans"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VOTE → flipkliq.com', WIDTH / 2, ctaY);

  return canvas.toBuffer('image/png');
}

async function generateVideo(poll) {
  const tmpDir = fs.mkdtempSync('/tmp/reel-');
  const framePath = path.join(tmpDir, 'frame.png');
  const videoPath = path.join(tmpDir, 'reel.mp4');

  try {
    console.log(`[generate] Drawing frame for poll ${poll.id}...`);
    const frameBuffer = await drawFrame(poll);
    fs.writeFileSync(framePath, frameBuffer);

    console.log(`[generate] Running FFmpeg...`);
    execSync(
      `ffmpeg -y -loop 1 -i "${framePath}" ` +
      `-vf "scale=${WIDTH}:${HEIGHT}" ` +
      `-t ${DURATION} -pix_fmt yuv420p -c:v libx264 -preset ultrafast -crf 28 "${videoPath}"`,
      { stdio: 'pipe' }
    );

    console.log(`[generate] Uploading to Supabase Storage...`);
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
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
