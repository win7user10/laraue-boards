type SearchBacklogIssuesResult = {
  BacklogPage: {
    hasNextPage: boolean
    issues: Array<{
      assignee: string
      assigneeColor: string
      assigneeInitial: string
      boardColor: string
      boardName: string
      canMove: boolean
      content: string
      id: string
      key: string
      status: string
      statusColor: string
    }>
  }
}

type SearchBacklogIssuesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type SearchBacklogIssues = (input: {
  backlogBoardId: string
  filters: Array<
    | { attributeId: string; searchString: string; type: 'text' }
    | { attributeId: string; type: 'list'; valueIds: string[] }
  >
  page: number
  search: string
}) => Promise<ActionResult<SearchBacklogIssuesResult, SearchBacklogIssuesError>>
