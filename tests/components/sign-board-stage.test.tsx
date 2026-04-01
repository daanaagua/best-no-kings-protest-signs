import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SignBoardStage } from '@/src/components/submit/sign-board-stage'
import { createLegacyTextBoardDocument } from '@/src/lib/signs/board-document'

describe('SignBoardStage', () => {
  it('positions the default text layer using responsive percentages inside the poster', () => {
    const board = createLegacyTextBoardDocument({
      slogan: 'Your slogan preview',
      selectedTemplate: 'classic',
    })

    render(
      <SignBoardStage
        assets={[]}
        board={board}
        onBoardChange={vi.fn()}
        onSelectLayer={vi.fn()}
        selectedLayerId={board.layers[0]?.id ?? null}
      />,
    )

    const hitbox = document.querySelector('.sign-board-stage__hitbox') as HTMLButtonElement | null
    const textLayer = document.querySelector('.sign-board-scene__text-layer') as HTMLDivElement | null
    const moveHandle = screen.getByTestId('stage-layer-handle-move')

    expect(hitbox).not.toBeNull()
    expect(textLayer).not.toBeNull()
    expect(hitbox?.style.left).toBe('20%')
    expect(hitbox?.style.top).toBe('39%')
    expect(hitbox?.style.width).toBe('60%')
    expect(hitbox?.style.height).toBe('22%')
    expect(textLayer?.style.left).toBe('20%')
    expect(textLayer?.style.top).toBe('39%')
    expect(moveHandle).toHaveStyle({ left: '50%', top: '50%' })
  })
})
