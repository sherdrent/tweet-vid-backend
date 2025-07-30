
const express = require('express')
const multer  = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const app = express()
app.use(cors())
const upload = multer({ dest: 'uploads/' })

app.post('/generate', upload.single('video'), (req, res) => {
  const { text, author, handle } = req.body
  const videoPath = req.file.path
  const outputPath = `outputs/${req.file.filename}_out.mp4`
  const fontPath = path.join(__dirname, 'Arial.ttf')
  const overlayText = `${author} ${handle ? '(' + handle + ')' : ''}\n${text}`
  const filter = [
    `drawtext=fontfile=${fontPath}:text='${overlayText.replace("'", "\'")}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.6:boxborderw=15:x=(w-text_w)/2:y=(h-text_h)/4`
  ]
  ffmpeg(videoPath)
    .videoFilters(filter)
    .outputOptions('-preset ultrafast')
    .on('end', () => {
      res.download(outputPath, 'tweet-video.mp4', () => {
        fs.unlinkSync(videoPath)
        fs.unlinkSync(outputPath)
      })
    })
    .on('error', (err) => {
      console.error(err)
      res.status(500).json({ error: "Video generation failed" })
      fs.unlinkSync(videoPath)
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    })
    .save(outputPath)
})
app.listen(3001, () => console.log('FFmpeg backend running on :3001'))
