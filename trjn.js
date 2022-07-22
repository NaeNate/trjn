const fs = require("fs")
const http = require("http")
const { Readable } = require("stream")

const loadFrames = () => {
  const framesPath = "frames"

  return fs
    .readdirSync(framesPath)
    .sort((a, b) => a.split(".")[0] - b.split(".")[0])
    .map((file) => fs.readFileSync(framesPath + "/" + file).toString())
}

const streamer = (stream) => {
  let index = 0
  const frames = loadFrames()

  return setInterval(() => {
    stream.push("\033[2J\033[3J\033[H")

    stream.push(frames[index])

    index = (index + 1) % frames.length
  }, 100)
}

const server = http.createServer((req, res) => {
  const stream = new Readable()
  stream._read = () => {}
  stream.pipe(res)

  const interval = streamer(stream)

  req.on("close", () => {
    stream.destroy()
    clearInterval(interval)
  })
})

const port = process.env.PORT || 3000

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
