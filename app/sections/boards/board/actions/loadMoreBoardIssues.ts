type LoadMoreBoardIssue = {
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  content: string
  id: string
  issueKey: string
  time: string
}

export type LoadMoreBoardIssuesResult = {
  hasNext: boolean
  issues: LoadMoreBoardIssue[]
}

export type LoadMoreBoardIssuesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type LoadMoreBoardIssues = (input: {
  filters: Array<
    | { attributeId: string; searchString: string; type: 'text' }
    | { attributeId: string; type: 'list'; valueIds: string[] }
  >
  offset: number
  search: string
  statusId: string
  take: number
}) => Promise<ActionResult<LoadMoreBoardIssuesResult, LoadMoreBoardIssuesError>>
