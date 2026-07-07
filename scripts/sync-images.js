/**
 * sync-images.js
 *
 * Scans public/images/ for image files whose names begin with a Hebrew
 * letter (א–ת), then updates the imagePaths arrays in src/data/letters.json
 * so the app automatically knows which images belong to each letter.
 *
 * Usage:
 *   npm run sync-images
 *
 * Naming convention:
 *   יונה.png   → assigned to י (yod)
 *   ארנב.jpg   → assigned to א (alef)
 *   קוף.png    → assigned to ק (qof)
 *
 * Files that do NOT start with a Hebrew character (e.g. home.png, Julie.png)
 * are silently ignored — they will not appear in any letter's imagePaths.
 *
 * Run this script every time you add, rename, or remove images.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const IMAGES_DIR   = join(ROOT, 'public', 'images')
const LETTERS_JSON = join(ROOT, 'src', 'data', 'letters.json')

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'])
const HEBREW_RE  = /^[א-ת]/   // alef (א) through tav (ת)

// ── 1. Collect all Hebrew-named image files, grouped by first character ──────

const allFiles = readdirSync(IMAGES_DIR)
const hebrewFiles = allFiles
  .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()) && HEBREW_RE.test(f))
  .sort()                              // deterministic order

const byFirstLetter = {}
for (const file of hebrewFiles) {
  const ch = file[0]                  // first Hebrew character
  ;(byFirstLetter[ch] ??= []).push(`/images/${file}`)
}

// ── 2. Read letters.json and patch imagePaths for each letter ─────────────────

const letters = JSON.parse(readFileSync(LETTERS_JSON, 'utf-8'))
let changedCount = 0

for (const entry of letters) {
  const newPaths = byFirstLetter[entry.letter] ?? []
  const oldJson  = JSON.stringify(entry.imagePaths)
  const newJson  = JSON.stringify(newPaths)
  if (oldJson !== newJson) {
    changedCount++
    entry.imagePaths = newPaths
  }
}

writeFileSync(LETTERS_JSON, JSON.stringify(letters, null, 2) + '\n', 'utf-8')

// ── 3. Summary ────────────────────────────────────────────────────────────────

const lettersSeen = Object.keys(byFirstLetter).length
console.log(`✓  ${hebrewFiles.length} Hebrew-named image(s) across ${lettersSeen} letter(s).`)
console.log(`✓  ${changedCount} letter entry/entries updated in letters.json.`)
if (hebrewFiles.length === 0) {
  console.log('')
  console.log('  Tip: rename your images to Hebrew words, e.g.:')
  console.log('    יונה.png   → י')
  console.log('    ארנב.png   → א')
}
