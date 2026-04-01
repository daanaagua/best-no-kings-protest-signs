import { useMemo, useState } from 'react'

import { SignBoardScene } from '@/src/components/submit/sign-board-scene'
import { getSignTemplateDefinition } from '@/src/lib/signs/templates'
import type {
  SignBoardDocument,
  SignBoardLayer,
  SubmissionAssetRecord,
} from '@/src/lib/signs/board-document'

type DragMode = 'move' | 'rotate' | 'resize'

type DragState = {
  mode: DragMode
  layerId: string
}

type SignBoardStageProps = {
  board: SignBoardDocument
  assets: SubmissionAssetRecord[]
  selectedLayerId: string | null
  onSelectLayer: (layerId: string) => void
  onBoardChange: (board: SignBoardDocument) => void
}

function updateLayer(board: SignBoardDocument, layerId: string, updates: Partial<SignBoardLayer>) {
  return {
    ...board,
    layers: board.layers.map((layer) =>
      layer.id === layerId ? ({ ...layer, ...updates } as SignBoardLayer) : layer,
    ),
  } satisfies SignBoardDocument
}

export function SignBoardStage({ board, assets, selectedLayerId, onSelectLayer, onBoardChange }: SignBoardStageProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const definition = getSignTemplateDefinition(board.templateId)
  const selectedLayer = useMemo(
    () => board.layers.find((layer) => layer.id === selectedLayerId),
    [board.layers, selectedLayerId],
  )

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState || !selectedLayer) {
      return
    }

    if (dragState.mode === 'move') {
      onBoardChange(updateLayer(board, dragState.layerId, { x: event.clientX, y: event.clientY }))
      return
    }

    if (dragState.mode === 'rotate') {
      onBoardChange(updateLayer(board, dragState.layerId, { rotation: Math.round((event.clientX - 200) / 2) }))
      return
    }

    onBoardChange(
      updateLayer(board, dragState.layerId, {
        width: Math.max(80, Math.round(event.clientX)),
        height: Math.max(80, Math.round(event.clientY)),
      }),
    )
  }

  return (
    <section className="sign-board-stage-wrap">
      <div className="section-heading section-heading--compact">
        <p className="section-heading__eyebrow">Stage</p>
        <h2 className="section-heading__title">Arrange the board visually</h2>
      </div>

      <div
        className="sign-board-stage"
        data-testid="sign-board-stage"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragState(null)}
      >
        <div className="sign-board-stage__poster" style={{ backgroundImage: `url(${definition.previewBackground})` }}>
          <SignBoardScene board={board} assets={assets} className="sign-board-stage__scene" />

          {board.layers.map((layer) => {
            if (!layer.visible) {
              return null
            }

            return (
              <button
                key={layer.id}
                className={`sign-board-stage__hitbox ${selectedLayerId === layer.id ? 'sign-board-stage__hitbox--selected' : ''}`}
                onClick={() => onSelectLayer(layer.id)}
                onDoubleClick={() => onSelectLayer(layer.id)}
                style={{
                  left: layer.x - layer.width / 2,
                  top: layer.y - layer.height / 2,
                  width: layer.width,
                  height: layer.height,
                }}
                type="button"
              >
                <span className="sr-only">{layer.name}</span>
              </button>
            )
          })}

          {selectedLayer ? (
            <>
              <button
                className="sign-board-stage__handle sign-board-stage__handle--move"
                data-testid="stage-layer-handle-move"
                onPointerDown={() => setDragState({ mode: 'move', layerId: selectedLayer.id })}
                style={{ left: selectedLayer.x, top: selectedLayer.y }}
                type="button"
              >
                Move
              </button>
              <button
                className="sign-board-stage__handle sign-board-stage__handle--rotate"
                data-testid="stage-layer-handle-rotate"
                onPointerDown={() => setDragState({ mode: 'rotate', layerId: selectedLayer.id })}
                style={{ left: selectedLayer.x + selectedLayer.width / 2, top: selectedLayer.y - selectedLayer.height / 2 }}
                type="button"
              >
                Rotate
              </button>
              <button
                className="sign-board-stage__handle sign-board-stage__handle--resize"
                data-testid="stage-layer-handle-resize"
                onPointerDown={() => setDragState({ mode: 'resize', layerId: selectedLayer.id })}
                style={{ left: selectedLayer.x + selectedLayer.width / 2, top: selectedLayer.y + selectedLayer.height / 2 }}
                type="button"
              >
                Resize
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
