import type { IssueListItem } from '~/components/issue-list/IssueList.types'

export type IssuesPageAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type IssuesPageData = {
  attributes: IssuesPageAttribute[]
  hasNextPage: boolean
  issues: IssueListItem[]
  spaces: Array<{ label: string; value: string }>
}

export type IssuesPageFilterValue = {
  attributes: Record<string, string | string[]>
  spaceIds: string[]
}
