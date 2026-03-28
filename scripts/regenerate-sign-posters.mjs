import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'signs.ts'), 'utf8')
const outDir = path.join(process.cwd(), 'public', 'signs')

const itemRegex = /slug: '([^']+)'[\s\S]*?title: '((?:\\'|[^'])+)'[\s\S]*?sourceType: '([^']+)'/g

const palettes = [
  {
    bg: '#d7d9de',
    board: '#f7f2e9',
    ink: '#171717',
    accent: '#7a1f1f',
    accent2: '#19324a',
    accent3: '#8b5e34',
    tape: '#d8ceb6',
    pole: '#7a5b3e',
  },
  {
    bg: '#d9d0c2',
    board: '#fbf7f0',
    ink: '#101820',
    accent: '#8b2c1d',
    accent2: '#304b63',
    accent3: '#6e4a2d',
    tape: '#d9c69f',
    pole: '#8b6840',
  },
  {
    bg: '#cfd7dc',
    board: '#f4efe6',
    ink: '#151515',
    accent: '#7d2622',
    accent2: '#26415b',
    accent3: '#6b4e31',
    tape: '#d6cfbe',
    pole: '#6f5339',
  },
  {
    bg: '#d7d3cd',
    board: '#fffaf2',
    ink: '#111111',
    accent: '#6f1d1b',
    accent2: '#1d3557',
    accent3: '#75543a',
    tape: '#d8cfb8',
    pole: '#7c5c3f',
  },
]

function hash(value) {
  let result = 0

  for (const character of value) {
    result = (result * 31 + character.charCodeAt(0)) >>> 0
  }

  return result
}

function escapeSvg(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function splitLongWord(word, maxChunk = 14) {
  if (word.length <= maxChunk) {
    return [word]
  }

  const chunks = []

  for (let index = 0; index < word.length; index += maxChunk) {
    chunks.push(word.slice(index, index + maxChunk))
  }

  return chunks
}

function buildLines(title) {
  const words = title
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .flatMap((word) => splitLongWord(word))

  const maxLineLength = words.length <= 3 ? 14 : words.length <= 6 ? 16 : 18
  const lines = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length <= maxLineLength || !current) {
      current = next
      continue
    }

    lines.push(current)
    current = word
  }

  if (current) {
    lines.push(current)
  }

  if (lines.length <= 4) {
    return lines
  }

  const balanced = []

  for (const line of lines) {
    if (balanced.length === 0) {
      balanced.push(line)
      continue
    }

    const previous = balanced[balanced.length - 1]

    if (balanced.length < 4 && `${previous} ${line}`.length <= maxLineLength + 3) {
      balanced[balanced.length - 1] = `${previous} ${line}`
    } else {
      balanced.push(line)
    }
  }

  return balanced.slice(0, 4)
}

function colorForLine(line, index, palette) {
  if (/\bNO\b/i.test(line) || /\bKINGS\b/i.test(line)) {
    return palette.accent
  }

  return [palette.ink, palette.accent2, palette.accent3][index % 3]
}

let match
let count = 0

while ((match = itemRegex.exec(source))) {
  const slug = match[1]
  const title = match[2].replace(/\\'/g, "'")
  const palette = palettes[hash(slug) % palettes.length]
  const lines = buildLines(title)
  const longest = Math.max(...lines.map((line) => line.length))
  const baseFontSize = lines.length >= 4 ? 68 : lines.length === 3 ? 80 : 94
  const fontSize = Math.max(54, baseFontSize - Math.max(0, longest - 14) * 2)
  const lineHeight = Math.round(fontSize * 1.08)
  const startY = 525 - ((lines.length - 1) * lineHeight) / 2
  const rotation = [-3.5, -2.25, 1.8, 3.1][hash(slug) % 4]

  const lineMarkup = lines
    .map((line, index) => {
      const y = Math.round(startY + index * lineHeight)

      return `<text x="540" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="${colorForLine(line, index, palette)}" letter-spacing="1.2">${escapeSvg(line.toUpperCase())}</text>`
    })
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-labelledby="title desc">
  <title id="title">${escapeSvg(title)}</title>
  <desc id="desc">${escapeSvg(title)}</desc>
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
    <pattern id="grain" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="18" r="1.1" fill="#000" opacity="0.13"/>
      <circle cx="58" cy="33" r="1.2" fill="#000" opacity="0.08"/>
      <circle cx="92" cy="76" r="1.1" fill="#000" opacity="0.1"/>
      <circle cx="26" cy="96" r="1" fill="#000" opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="1080" height="1350" fill="${palette.bg}"/>
  <rect width="1080" height="1350" fill="url(#grain)" opacity="0.08"/>
  <rect x="517" y="970" width="46" height="240" rx="20" fill="${palette.pole}" opacity="0.92"/>
  <g transform="translate(540 540) rotate(${rotation})" filter="url(#shadow)">
    <rect x="-332" y="-382" width="664" height="790" rx="18" fill="${palette.board}" stroke="#181818" stroke-width="10"/>
    <rect x="-316" y="-366" width="632" height="758" rx="14" fill="none" stroke="rgba(24,24,24,0.12)" stroke-width="3"/>
    <rect x="-255" y="-360" width="150" height="22" rx="4" fill="${palette.tape}" opacity="0.98" transform="rotate(-8 -255 -360)"/>
    <rect x="105" y="-360" width="150" height="22" rx="4" fill="${palette.tape}" opacity="0.98" transform="rotate(9 105 -360)"/>
    ${lineMarkup}
  </g>
  <text x="1030" y="1298" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#262626" opacity="0.55" letter-spacing="2">NO KINGS PROTEST SIGNS</text>
</svg>`

  fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg)
  count += 1
}

console.log(`regenerated ${count} sign posters`)
