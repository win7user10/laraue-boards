type SearchBoardIssue = {
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  content: string
  issueKey: string
  time: string
}

export type SearchBoardIssuesResult = {
  BoardPage: {
    columns: Array<{
      hasNext: boolean
      id: string
      issueCount: number
      issues: SearchBoardIssue[]
    }>
    issueCount: number
  }
}

type SearchBoardIssuesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type SearchBoardIssues = (input: {
  boardId: string
  filters: Array<
    | { attributeId: string; searchString: string; type: 'text' }
    | { attributeId: string; type: 'list'; valueIds: string[] }
  >
  search: string
  take: number
}) => Promise<ActionResult<SearchBoardIssuesResult, SearchBoardIssuesError>>
