const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Set up upload folder
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

// Test route
app.get('/', (req, res) => {
  res.send('Tweet Vid Backend is running!');
});

// Video processing route
app.post('/api/generate', upload.single('video'), (req, res) => {
  const tweetText = req.body.tweetText || 'Hello world!';
  const inputPath = req.file.path;
  const outputName = `${Date.now()}-out.mp4`;
  const outputPath = path.join('outputs', outputName);

  // Example FFmpeg command: overlay text on the video
  // Requires Arial.ttf in the root directory
  const cmd = `ffmpeg -i ${inputPath} -vf "drawtext=fontfile=./Arial.ttf:text='${tweetText}':fontcolor=white:fontsize=36:x=10:y=10:box=1:boxcolor=black@0.5" -codec:a copy ${outputPath}`;

  exec(cmd, (error) => {
    // Delete input file
    fs.unlinkSync(inputPath);
    if (error) return res.status(500).send({ error: 'FFmpeg error', details: error.message });
    res.download(outputPath, () => fs.unlinkSync(outputPath));
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
