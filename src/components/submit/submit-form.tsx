'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import { SignBoardStage } from '@/src/components/submit/sign-board-stage'
import { SignLayerInspector } from '@/src/components/submit/sign-layer-inspector'
import { SignLayerList } from '@/src/components/submit/sign-layer-list'
import {
  DEFAULT_BLANK_BOARD_RATIO_ID,
  getBlankBoardRatioIdForDimensions,
  type BlankBoardRatioId,
} from '@/src/lib/signs/blank-board-ratios'
import {
  applyBlankBoardRatio,
  createBlankBoardDocument,
  createImageLayer,
  createStarterBoardDocument,
  createTextLayer,
  getPrimaryBoardText,
  type SignBoardDocument,
  type SignBoardImageLayer,
  type SignBoardLayer,
  type SignBoardTextLayer,
  type SubmissionAssetRecord,
} from '@/src/lib/signs/board-document'
import { buildExportFileName, exportPreviewAsPng } from '@/src/lib/signs/export-preview'
import { createSubmissionAssetFromFile } from '@/src/lib/signs/image-upload'
import { PUBLIC_SUBMISSION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { validateSubmission } from '@/src/lib/submissions/validation'
import { type SignTemplateId } from '@/src/lib/signs/templates'

type SubmitFormProps = {
  communityMvpEnabled?: boolean
}

type SubmitMetaState = {
  submitterName: string
  submitterEmail: string
  acceptedPolicy: boolean
  confirmedOwnership: boolean
}

const INITIAL_TEMPLATE_ID: SignTemplateId = 'blank-white'

function replaceLayer(board: SignBoardDocument, layerId: string, nextLayer: SignBoardLayer): SignBoardDocument {
  return {
    ...board,
    layers: board.layers.map((layer) => (layer.id === layerId ? nextLayer : layer)),
  }
}

export function SubmitForm({ communityMvpEnabled = false }: SubmitFormProps) {
  const [board, setBoard] = useState<SignBoardDocument>(() => createStarterBoardDocument(INITIAL_TEMPLATE_ID))
  const [submissionAssets, setSubmissionAssets] = useState<SubmissionAssetRecord[]>([])
  const [lastBlankBoardRatioId, setLastBlankBoardRatioId] = useState<BlankBoardRatioId>(DEFAULT_BLANK_BOARD_RATIO_ID)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [metaState, setMetaState] = useState<SubmitMetaState>({
    submitterName: '',
    submitterEmail: '',
    acceptedPolicy: false,
    confirmedOwnership: false,
  })
  const previewExportRef = useRef<HTMLDivElement | null>(null)

  const selectedLayer = useMemo(
    () => board.layers.find((layer) => layer.id === selectedLayerId),
    [board.layers, selectedLayerId],
  )

  useEffect(() => {
    if (!selectedLayerId && board.layers[0]) {
      setSelectedLayerId(board.layers[0].id)
    }
  }, [board.layers, selectedLayerId])

  function setBoardWithSelection(nextBoard: SignBoardDocument, nextSelectedLayerId?: string | null) {
    setBoard(nextBoard)
    setSelectedLayerId(nextSelectedLayerId ?? nextBoard.layers[0]?.id ?? null)
  }

  function handleTemplateChange(templateId: SignTemplateId) {
    const nextBoard =
      templateId === 'blank-white'
        ? createBlankBoardDocument(lastBlankBoardRatioId)
        : createStarterBoardDocument(templateId)

    setBoardWithSelection(nextBoard, nextBoard.layers[0]?.id ?? null)
    setSubmissionAssets([])
  }

  function handleBlankBoardRatioChange(ratioId: BlankBoardRatioId) {
    setLastBlankBoardRatioId(ratioId)

    if (board.templateId !== 'blank-white') {
      return
    }

    const nextBoard = applyBlankBoardRatio(board, ratioId)
    setBoardWithSelection(nextBoard, selectedLayerId)
  }

  function handleAddText() {
    const nextLayer = createTextLayer({
      name: `Text layer ${board.layers.filter((layer) => layer.type === 'text').length + 1}`,
      text: 'Text layer',
      x: 220,
      y: 240,
    })

    setBoardWithSelection({
      ...board,
      layers: [...board.layers, nextLayer],
    }, nextLayer.id)
  }

  async function handleUploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const asset = await createSubmissionAssetFromFile(file)
    const nextLayer = createImageLayer({
      name: file.name,
      imageAssetId: asset.id,
      alt: file.name,
      x: 220,
      y: 240,
      width: 220,
      height: 220,
    })

    setSubmissionAssets((current) => [...current, asset])
    setBoardWithSelection(
      {
        ...board,
        layers: [...board.layers, nextLayer],
      },
      nextLayer.id,
    )
    event.target.value = ''
  }

  function handleDuplicateLayer() {
    if (!selectedLayer) {
      return
    }

    const nextLayer =
      selectedLayer.type === 'text'
        ? createTextLayer({ ...selectedLayer, id: undefined, x: selectedLayer.x + 24, y: selectedLayer.y + 24 })
        : createImageLayer({ ...selectedLayer, id: undefined, x: selectedLayer.x + 24, y: selectedLayer.y + 24 })

    setBoardWithSelection({
      ...board,
      layers: [...board.layers, nextLayer],
    }, nextLayer.id)
  }

  function handleDeleteLayer() {
    if (!selectedLayer) {
      return
    }

    const nextLayers = board.layers.filter((layer) => layer.id !== selectedLayer.id)
    setBoardWithSelection({ ...board, layers: nextLayers }, nextLayers[0]?.id ?? null)
  }

  function moveSelectedLayer(direction: 'forward' | 'backward') {
    if (!selectedLayer) {
      return
    }

    const index = board.layers.findIndex((layer) => layer.id === selectedLayer.id)
    const targetIndex = direction === 'forward' ? Math.min(board.layers.length - 1, index + 1) : Math.max(0, index - 1)

    if (index === targetIndex) {
      return
    }

    const nextLayers = [...board.layers]
    const [movedLayer] = nextLayers.splice(index, 1)

    nextLayers.splice(targetIndex, 0, movedLayer)
    setBoardWithSelection({ ...board, layers: nextLayers }, selectedLayer.id)
  }

  function updateSelectedLayer(nextLayer: SignBoardLayer) {
    if (!selectedLayer) {
      return
    }

    setBoardWithSelection(replaceLayer(board, selectedLayer.id, nextLayer), selectedLayer.id)
  }

  function handleUpdateTextLayer(updates: Partial<SignBoardTextLayer>) {
    if (!selectedLayer || selectedLayer.type !== 'text') {
      return
    }

    updateSelectedLayer({ ...selectedLayer, ...updates })
  }

  function handleUpdateImageLayer(updates: Partial<SignBoardImageLayer>) {
    if (!selectedLayer || selectedLayer.type !== 'image') {
      return
    }

    updateSelectedLayer({ ...selectedLayer, ...updates })
  }

  function handleUpdateLayerFrame(
    updates: Partial<Pick<SignBoardLayer, 'x' | 'y' | 'width' | 'height' | 'rotation'>>,
  ) {
    if (!selectedLayer) {
      return
    }

    updateSelectedLayer({ ...selectedLayer, ...updates })
  }

  function handleToggleVisibility() {
    if (!selectedLayer) {
      return
    }

    updateSelectedLayer({ ...selectedLayer, visible: !selectedLayer.visible })
  }

  async function handleExport() {
    if (!previewExportRef.current || isExporting) {
      return
    }

    try {
      setIsExporting(true)
      await exportPreviewAsPng(previewExportRef.current, buildExportFileName(getPrimaryBoardText(board)))
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = validateSubmission({
      boardDocument: board,
      submissionAssets,
      submitterName: metaState.submitterName,
      submitterEmail: metaState.submitterEmail,
      acceptedPolicy: metaState.acceptedPolicy,
      confirmedOwnership: metaState.confirmedOwnership,
    })

    if (!result.success) {
      return
    }

    await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...result.value,
        boardDocument: board,
        submissionAssets,
      }),
    }).catch(() => null)
  }

  return (
    <form className="submit-layout sign-designer" noValidate onSubmit={handleSubmit}>
      <SignLayerList
        board={board}
        onAddText={handleAddText}
        onDeleteLayer={handleDeleteLayer}
        onDuplicateLayer={handleDuplicateLayer}
        onMoveLayerBackward={() => moveSelectedLayer('backward')}
        onMoveLayerForward={() => moveSelectedLayer('forward')}
        onSelectLayer={setSelectedLayerId}
        onUploadImage={handleUploadImage}
        selectedLayerId={selectedLayerId}
      />

      <div className="sign-designer__center" ref={previewExportRef}>
        <SignBoardStage
          assets={submissionAssets}
          board={board}
          onBoardChange={setBoard}
          onSelectLayer={setSelectedLayerId}
          selectedLayerId={selectedLayerId}
        />

        <button className="site-cta submit-export-button" onClick={handleExport} type="button">
          {isExporting ? 'Exporting PNG...' : 'Export PNG'}
        </button>

        {communityMvpEnabled ? (
          <div className="submit-form__meta">
            <label className="submit-field">
              <span className="submit-field__label">Your name</span>
              <input
                className="submit-field__input"
                onChange={(event) => setMetaState((current) => ({ ...current, submitterName: event.target.value }))}
                type="text"
                value={metaState.submitterName}
              />
            </label>
            <label className="submit-field">
              <span className="submit-field__label">Email</span>
              <input
                className="submit-field__input"
                onChange={(event) => setMetaState((current) => ({ ...current, submitterEmail: event.target.value }))}
                type="email"
                value={metaState.submitterEmail}
              />
              <p>Optional. Not shown publicly.</p>
            </label>
            <label className="submit-check">
              <input
                checked={metaState.acceptedPolicy}
                onChange={(event) => setMetaState((current) => ({ ...current, acceptedPolicy: event.target.checked }))}
                type="checkbox"
              />
              I agree to the content policy for community submissions.
            </label>
            <label className="submit-check">
              <input
                checked={metaState.confirmedOwnership}
                onChange={(event) =>
                  setMetaState((current) => ({ ...current, confirmedOwnership: event.target.checked }))
                }
                type="checkbox"
              />
              I confirm ownership or safe-to-share rights for this design.
            </label>
            <button className="site-cta" type="submit">
              Submit styled sign for review
            </button>
          </div>
        ) : (
          <div className="submit-form__message submit-form__message--success" role="status">
            <p>{PUBLIC_SUBMISSION_BETA_MESSAGE}</p>
            <p>Use the stage to add text, upload images, and fine-tune the board directly.</p>
          </div>
        )}
      </div>

      <SignLayerInspector
        blankBoardRatioId={getBlankBoardRatioIdForDimensions(board.canvasWidth, board.canvasHeight)}
        board={board}
        onBlankBoardRatioChange={handleBlankBoardRatioChange}
        onTemplateChange={handleTemplateChange}
        onToggleVisibility={handleToggleVisibility}
        onUpdateImageLayer={handleUpdateImageLayer}
        onUpdateLayerFrame={handleUpdateLayerFrame}
        onUpdateTextLayer={handleUpdateTextLayer}
        selectedLayer={selectedLayer}
      />
    </form>
  )
}
