import type { IssueListItem } from '~/components/issue-list/IssueList.types'
import type { Result } from '~/utils/actionResult'

type IssuesFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type SearchIssues = (input: {
  filters: IssuesFilter[]
  page: number
  search: string
  spaceIds: string[]
}) => Promise<Result<{ hasNextPage: boolean; issues: IssueListItem[] }>>
