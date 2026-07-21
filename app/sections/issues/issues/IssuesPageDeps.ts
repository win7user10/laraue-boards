import type { IssueListDeps } from '~/components/issues/issue-list/IssueListDeps'
import type { SearchIssues } from '~/sections/issues/issues/deps/searchIssues'
import type { ViewIssuesPage } from '~/sections/issues/issues/deps/viewIssuesPage'

export type IssuesPageDeps = {
  issueList: IssueListDeps
  searchIssues: SearchIssues
  viewIssuesPage: ViewIssuesPage
}
