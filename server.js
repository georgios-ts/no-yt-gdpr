const express = require('express')
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg');

const app = express()

const url = "https://youtu.be/BhB6Lb7_kN8"
const id = 'BhB6Lb7_kN8'

app.use(express.static(path.join(__dirname, 'public')))


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/video', function(req, res) {

  console.log(req.url)
  console.log(req.headers)

  ytdl.getInfo(id, {format: '19'}, (err, info) => {
    if (err) throw err
    const fileSize = info.player_response.streamingData.formats[0].contentLength
    const range = req.headers.range

    if (range) {

      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1

      const chunksize = (end-start)+1
      const file = ytdl(url, { format: '19',
                                range: { start: start,
                                           end: end }
      })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(206, head)
      file.pipe(res)

    } else {

      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(200, head)
      ytdl(url, {format: '19'})
        .pipe(res)
    }
  })
})


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
