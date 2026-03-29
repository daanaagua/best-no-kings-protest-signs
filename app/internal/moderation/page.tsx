import { cookies } from 'next/headers'

import { INTERNAL_MODERATION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { isCommunityMvpEnabled } from '@/src/lib/runtime-mode'
import {
  MODERATION_SESSION_COOKIE_NAME,
  isModerationAuthConfigured,
  isValidModerationSessionValue,
} from '@/src/lib/submissions/moderation-auth'
import { listPendingSubmissions } from '@/src/lib/submissions/store'

export const metadata = {
  title: 'Internal Moderation | Best No Kings Protest Signs',
  description:
    'Protected internal moderation queue for reviewing community sign submissions.',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function ModerationPage() {
  if (!isCommunityMvpEnabled()) {
    return (
      <div className="moderation-page">
        <section className="moderation-page__panel">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Internal moderation</p>
            <h1 className="section-heading__title">Moderation queue unavailable</h1>
            <p className="section-heading__description">{INTERNAL_MODERATION_BETA_MESSAGE}</p>
          </div>
        </section>
      </div>
    )
  }

  if (!isModerationAuthConfigured()) {
    return (
      <div className="moderation-page">
        <section className="moderation-page__panel">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Internal moderation</p>
            <h1 className="section-heading__title">Moderation config missing</h1>
            <p className="section-heading__description">
              Set INTERNAL_MODERATION_TOKEN and INTERNAL_MODERATION_SESSION_SECRET before using
              the internal moderation queue.
            </p>
          </div>
        </section>
      </div>
    )
  }

  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(MODERATION_SESSION_COOKIE_NAME)?.value

  if (!isValidModerationSessionValue(sessionValue)) {
    return (
      <div className="moderation-page">
        <section className="moderation-page__panel">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Internal moderation</p>
            <h1 className="section-heading__title">Moderation sign in</h1>
            <p className="section-heading__description">
              Start a short-lived moderation session to review pending community submissions.
            </p>
          </div>

          <form action="/api/internal/moderation/session" method="post" className="moderation-auth-form">
            <label htmlFor="moderation-token">Moderation token</label>
            <input id="moderation-token" name="token" type="password" autoComplete="current-password" />
            <button type="submit">Start moderation session</button>
          </form>
        </section>
      </div>
    )
  }

  const pendingSubmissions = await listPendingSubmissions()

  return (
    <div className="moderation-page">
      <section className="moderation-page__panel">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Internal moderation</p>
          <h1 className="section-heading__title">Pending submissions</h1>
          <p className="section-heading__description">
            Review the internal queue and send each submission to approve or reject.
          </p>
        </div>

        <ul>
          {pendingSubmissions.map((submission) => (
            <li key={submission.id}>
              <article>
                <h2>{submission.slogan}</h2>
                <p>{submission.categories.join(', ')}</p>
                <p>{submission.slugCandidate}</p>

                <form
                  action={`/api/internal/moderation/submissions/${submission.id}`}
                  method="post"
                >
                  <input type="hidden" name="action" value="approve" />
                  <label htmlFor={`moderator-note-${submission.id}`}>Moderator note</label>
                  <textarea id={`moderator-note-${submission.id}`} name="moderatorNote" />
                  <button type="submit" aria-label={`Approve ${submission.id}`}>
                    Approve
                  </button>
                </form>

                <form
                  action={`/api/internal/moderation/submissions/${submission.id}`}
                  method="post"
                >
                  <input type="hidden" name="action" value="reject" />
                  <input type="hidden" name="moderatorNote" value="Needs revision" />
                  <button type="submit" aria-label={`Reject ${submission.id}`}>
                    Reject
                  </button>
                </form>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
