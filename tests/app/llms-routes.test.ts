import { describe, expect, it } from 'vitest'

import { GET as getLlmsFull } from '@/app/llms-full.txt/route'
import { GET as getLlms } from '@/app/llms.txt/route'

describe('llms routes', () => {
  it('describes the public submit route as a sign maker in llms.txt', async () => {
    const response = await getLlms()
    const content = await response.text()

    expect(content).toContain('browser-based sign maker')
    expect(content).toContain('instant PNG export')
    expect(content).toContain('browser-based sign making')
    expect(content).toContain('/topics/no-kings/kids')
    expect(content).toContain('/topics/no-kings/top/printable')
    expect(content).not.toContain('/topics/no-kings/funny')
    expect(content).not.toContain('/topics/no-kings/top/funny')
    expect(content).not.toMatch(/preview|beta-gated/i)
  })

  it('describes live browsing and png exports in llms-full.txt', async () => {
    const response = await getLlmsFull()
    const content = await response.text()

    expect(content).toContain('lightweight sign-making tool')
    expect(content).toContain('PNG exports are all available on public routes')
    expect(content).toContain('/topics/no-kings/kids')
    expect(content).toContain('/topics/no-kings/top/printable')
    expect(content).not.toContain('/topics/no-kings/funny')
    expect(content).not.toContain('/topics/no-kings/top/funny')
    expect(content).not.toContain('short satirical wording')
    expect(content).not.toMatch(/preview|beta-gated/i)
  })
})
