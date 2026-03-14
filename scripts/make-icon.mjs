import { PNG } from 'pngjs'
import fs from 'fs'

const size = 512
const png = new PNG({ width: size, height: size })

// simple dark background + white glyph-like letters
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const idx = (size * y + x) << 2
    // background
    png.data[idx] = 15
    png.data[idx + 1] = 15
    png.data[idx + 2] = 18
    png.data[idx + 3] = 255
  }
}

function fillRect(x0, y0, w, h, r, g, b) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue
      const idx = (size * y + x) << 2
      png.data[idx] = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = 255
    }
  }
}

// draw a simple ticket-ish icon
const pad = 64
fillRect(pad, 170, size - pad * 2, 172, 245, 245, 245)
fillRect(pad + 32, 206, size - pad * 2 - 64, 12, 30, 30, 35)
fillRect(pad + 32, 236, size - pad * 2 - 140, 12, 30, 30, 35)
fillRect(pad + 32, 266, size - pad * 2 - 100, 12, 30, 30, 35)

png.pack().pipe(fs.createWriteStream('app-icon.png')).on('finish', () => {
  console.log('wrote app-icon.png')
})
