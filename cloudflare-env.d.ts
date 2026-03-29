type SubmissionD1Value = number | string | null

interface SubmissionD1PreparedStatement {
  bind(...values: SubmissionD1Value[]): SubmissionD1PreparedStatement
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>
  first<T = unknown>(columnName?: string): Promise<T | null>
  run(): Promise<unknown>
}

interface SubmissionD1Database {
  prepare(query: string): SubmissionD1PreparedStatement
}

declare global {
  interface CloudflareEnv {
    SUBMISSIONS_DB?: SubmissionD1Database
  }
}

export {}
