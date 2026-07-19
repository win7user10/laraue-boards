type SearchIssuesResult = {
  IssuesPage: {
    hasNextPage: boolean
    issues: Array<{
      assignee: string
      assigneeColor: string
      assigneeInitial: string
      boardColor: string
      boardName: string
      canMove: boolean
      content: string
      issueKey: string
      spaceColor: string
      spaceName: string
      status: string
      statusColor: string
    }>
  }
}

type SearchIssuesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type SearchIssues = (input: {
  filters: Array<
    | { attributeId: string; searchString: string; type: 'text' }
    | { attributeId: string; type: 'list'; valueIds: string[] }
  >
  page: number
  search: string
  spaceIds: string[]
}) => Promise<ActionResult<SearchIssuesResult, SearchIssuesError>>
