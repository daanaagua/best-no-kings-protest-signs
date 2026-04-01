import { describe, expect, it } from 'vitest'

import {
  SIGN_TEMPLATE_IDS,
  buildTemplatePreviewDataUrl,
  getSignTemplateDefinition,
} from '@/src/lib/signs/templates'

function decodeSvgAsset(dataUrl: string) {
  return decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=UTF-8,', ''))
}

describe('buildTemplatePreviewDataUrl', () => {
  it('includes the blank white board in the supported template ids', () => {
    expect(SIGN_TEMPLATE_IDS).toContain('blank-white')
    expect(getSignTemplateDefinition('blank-white')).toMatchObject({
      id: 'blank-white',
      label: 'Blank white board',
    })
  })

  it('encodes style-aware text options into the generated asset', () => {
    const asset = (
      buildTemplatePreviewDataUrl as unknown as (
        slogan: string,
        template: 'tilted',
        options: {
          selectedTextColor: 'signal-red'
          textRotation: number
          textOffsetY: number
          textScale: number
        },
      ) => string
    )('Power to the Public', 'tilted', {
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
    })

    const svg = decodeSvgAsset(asset)

    expect(svg).toContain('fill="#b42318"')
    expect(svg).toContain('rotate(8 400 500)')
    expect(svg).toContain('translate(0 12)')
    expect(svg).toContain('scale(1.14)')
  })

  it('keeps the template text color when no explicit color option is provided', () => {
    const asset = buildTemplatePreviewDataUrl('Poster power', 'printable')
    const svg = decodeSvgAsset(asset)

    expect(svg).toContain('fill="#111111"')
    expect(svg).not.toContain('fill="#171717"')
  })
})
