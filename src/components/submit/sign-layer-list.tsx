import type { ChangeEvent } from 'react'

import type { SignBoardDocument } from '@/src/lib/signs/board-document'

type SignLayerListProps = {
  board: SignBoardDocument
  selectedLayerId: string | null
  onSelectLayer: (layerId: string) => void
  onAddText: () => void
  onDuplicateLayer: () => void
  onDeleteLayer: () => void
  onMoveLayerForward: () => void
  onMoveLayerBackward: () => void
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void
}

export function SignLayerList({
  board,
  selectedLayerId,
  onSelectLayer,
  onAddText,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerForward,
  onMoveLayerBackward,
  onUploadImage,
}: SignLayerListProps) {
  return (
    <section className="sign-layer-list" aria-label="Layer list">
      <div className="section-heading section-heading--compact">
        <p className="section-heading__eyebrow">Layers</p>
        <h2 className="section-heading__title">Build the sign directly</h2>
      </div>

      <div className="sign-layer-list__actions">
        <button className="site-cta" onClick={onAddText} type="button">
          Add text
        </button>
        <label className="site-cta sign-layer-list__upload" htmlFor="sign-image-upload">
          Upload image
        </label>
        <input
          accept="image/*"
          aria-label="Upload image"
          className="sign-layer-list__file-input"
          id="sign-image-upload"
          onChange={onUploadImage}
          type="file"
        />
        <button className="home-hero__secondary" onClick={onDuplicateLayer} type="button">
          Duplicate layer
        </button>
        <button className="home-hero__secondary" onClick={onDeleteLayer} type="button">
          Delete layer
        </button>
        <button className="home-hero__secondary" onClick={onMoveLayerForward} type="button">
          Bring forward
        </button>
        <button className="home-hero__secondary" onClick={onMoveLayerBackward} type="button">
          Send backward
        </button>
      </div>

      <div className="sign-layer-list__stack">
        {board.layers.map((layer) => {
          const isSelected = layer.id === selectedLayerId

          return (
            <button
              key={layer.id}
              className={`sign-layer-list__item ${isSelected ? 'sign-layer-list__item--selected' : ''}`}
              onClick={() => onSelectLayer(layer.id)}
              type="button"
            >
              <span>{layer.name}</span>
              <span>{layer.type === 'text' ? 'Text layer' : layer.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
