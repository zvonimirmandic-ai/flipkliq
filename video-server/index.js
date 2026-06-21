const express = require('express');
const { generateVideo } = require('./generate');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/generate-video', async (req, res) => {
  try {
    const poll = req.body;
    if (!poll || !poll.id) {
      return res.status(400).json({ error: 'Missing poll data. Body must include poll id.' });
    }
    const result = await generateVideo(poll);
    res.json(result);
  } catch (err) {
    console.error('[/generate-video] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Flipkliq video server running on port ${PORT}`);
});
