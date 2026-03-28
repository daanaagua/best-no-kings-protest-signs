import { redirect } from 'next/navigation'

import { INTERNAL_MODERATION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import {
  approveSubmission,
  listApprovedSubmissions,
  listPendingSubmissions,
  listSubmissions,
  rejectSubmission,
} from '@/src/lib/submissions/store'

export const dynamic = 'force-dynamic'

type ModerationPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

function getTokenValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isAuthorized(token: string | undefined) {
  return Boolean(process.env.MODERATION_TOKEN) && token === process.env.MODERATION_TOKEN
}

async function approveAction(formData: FormData) {
  'use server'

  const token = String(formData.get('token') ?? '')
  const submissionId = String(formData.get('submissionId') ?? '')
  const moderatorNote = String(formData.get('moderatorNote') ?? '')

  if (!isAuthorized(token) || !submissionId) {
    redirect('/internal/moderation')
  }

  await approveSubmission(submissionId, moderatorNote)
  redirect(`/internal/moderation?token=${encodeURIComponent(token)}`)
}

async function rejectAction(formData: FormData) {
  'use server'

  const token = String(formData.get('token') ?? '')
  const submissionId = String(formData.get('submissionId') ?? '')
  const moderatorNote = String(formData.get('moderatorNote') ?? '')

  if (!isAuthorized(token) || !submissionId) {
    redirect('/internal/moderation')
  }

  await rejectSubmission(submissionId, moderatorNote || 'Rejected by moderator')
  redirect(`/internal/moderation?token=${encodeURIComponent(token)}`)
}

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
  const token = getTokenValue((await searchParams).token)

  if (!isAuthorized(token)) {
    return (
      <div className="moderation-page">
        <section className="moderation-page__panel">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Internal moderation beta</p>
            <h1 className="section-heading__title">Moderation token required</h1>
            <p className="section-heading__description">
              {INTERNAL_MODERATION_BETA_MESSAGE} Add `?token=YOUR_MODERATION_TOKEN` to this URL to review launch-hold submissions.
            </p>
          </div>
        </section>
      </div>
    )
  }

  const [pending, approved, allSubmissions] = await Promise.all([
    listPendingSubmissions(),
    listApprovedSubmissions(),
    listSubmissions(),
  ])
  const rejected = allSubmissions.filter((submission) => submission.status === 'rejected')

  return (
    <div className="moderation-page">
      <section className="moderation-page__panel">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Internal moderation beta</p>
          <h1 className="section-heading__title">Review the internal launch-hold queue</h1>
          <p className="section-heading__description">
            {INTERNAL_MODERATION_BETA_MESSAGE} This token-gated page remains available only for manual internal review of file-backed records.
          </p>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Pending</dt>
            <dd>{pending.length}</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Approved</dt>
            <dd>{approved.length}</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Rejected</dt>
            <dd>{rejected.length}</dd>
          </div>
        </dl>
      </section>

      <section className="moderation-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Pending queue</p>
          <h2 className="section-heading__title">Approve or reject launch-hold community slogans</h2>
        </div>

        <div className="moderation-list">
          {pending.length === 0 ? (
            <p className="section-heading__description">No pending submissions right now.</p>
          ) : (
            pending.map((submission) => (
              <article key={submission.id} className="moderation-card">
                <div className="moderation-card__copy">
                  <p className="moderation-card__status">Pending</p>
                  <h3 className="moderation-card__title">{submission.slogan}</h3>
                  <p className="moderation-card__meta">
                    `{submission.slugCandidate}` · {submission.selectedTemplate} · {submission.createdAt}
                  </p>
                  {submission.submitterName ? <p className="moderation-card__meta">By {submission.submitterName}</p> : null}
                  {submission.submitterEmail ? <p className="moderation-card__meta">Email: {submission.submitterEmail}</p> : null}
                </div>

                <div className="moderation-card__actions">
                  <form action={approveAction} className="moderation-card__form">
                    <input name="token" type="hidden" value={token} />
                    <input name="submissionId" type="hidden" value={submission.id} />
                    <input className="submit-field__input" name="moderatorNote" placeholder="Optional approval note" type="text" />
                    <button className="site-cta" type="submit">Approve</button>
                  </form>

                  <form action={rejectAction} className="moderation-card__form">
                    <input name="token" type="hidden" value={token} />
                    <input name="submissionId" type="hidden" value={submission.id} />
                    <input className="submit-field__input" name="moderatorNote" placeholder="Reason for rejection" type="text" />
                    <button className="home-hero__secondary" type="submit">Reject</button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="moderation-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Recent decisions</p>
          <h2 className="section-heading__title">Approved and rejected records</h2>
        </div>

        <div className="moderation-history">
          {[...approved, ...rejected].map((submission) => (
            <article key={submission.id} className="moderation-history__item">
              <p className="moderation-card__status">{submission.status}</p>
              <h3 className="moderation-card__title">{submission.slogan}</h3>
              <p className="moderation-card__meta">{submission.slugCandidate}</p>
              {submission.moderatorNote ? (
                <p className="moderation-card__meta">Moderator note: {submission.moderatorNote}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
