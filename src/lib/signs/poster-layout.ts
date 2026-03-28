function normalizeTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim()
}

function splitLongWord(word: string, maxChunk = 14) {
  if (word.length <= maxChunk) {
    return [word]
  }

  const chunks: string[] = []

  for (let index = 0; index < word.length; index += maxChunk) {
    chunks.push(word.slice(index, index + maxChunk))
  }

  return chunks
}

export function buildPosterLayoutLines(title: string) {
  const words = normalizeTitle(title)
    .split(' ')
    .filter(Boolean)
    .flatMap((word) => splitLongWord(word))

  if (words.length === 0) {
    return ['NO KINGS']
  }

  const maxLineLength = words.length <= 3 ? 14 : words.length <= 6 ? 16 : 18
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const next = currentLine ? `${currentLine} ${word}` : word

    if (next.length <= maxLineLength || !currentLine) {
      currentLine = next
      continue
    }

    lines.push(currentLine)
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  if (lines.length <= 4) {
    return lines
  }

  const balanced: string[] = []

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
