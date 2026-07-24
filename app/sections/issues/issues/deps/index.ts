import type { IssueListDeps } from '~/components/issue-list/deps'

import type { SearchIssues } from './searchIssues'
import type { ViewIssues } from './viewIssues'

export type { ViewIssuesFailure } from './viewIssues'

export type IssuesPageDeps = {
  issueList: IssueListDeps
  searchIssues: SearchIssues
  view: ViewIssues
}
