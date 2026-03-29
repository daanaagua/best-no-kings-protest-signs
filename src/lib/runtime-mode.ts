export function isCommunityMvpEnabled() {
  return process.env.ENABLE_COMMUNITY_MVP === 'true'
}

export function shouldIncludeApprovedSubmissionSignsInPublicQueries() {
  return isCommunityMvpEnabled()
}
