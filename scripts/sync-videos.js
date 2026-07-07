import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = join(__dirname, '..')
const VIDEOS_DIR = join(ROOT, 'public', 'videos')
const OUT_FILE   = join(ROOT, 'src', 'data', 'videos.json')

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])

const files = readdirSync(VIDEOS_DIR)
  .filter(f => VIDEO_EXTS.has(extname(f).toLowerCase()))
  .sort()
  .map(f => `/videos/${f}`)

writeFileSync(OUT_FILE, JSON.stringify(files, null, 2) + '\n', 'utf-8')
console.log(`✓  ${files.length} video(s) written to src/data/videos.json`)
files.forEach(f => console.log(`   ${f}`))
