import type { IssueListDeps } from '~/components/issues/issue-list/IssueListDeps'
import type { SearchBacklogIssues } from '~/sections/spaces/backlog/deps/searchBacklogIssues'
import type { ViewBacklogPage } from '~/sections/spaces/backlog/deps/viewBacklogPage'

export type BacklogPageDeps = {
  issueList: IssueListDeps
  searchBacklogIssues: SearchBacklogIssues
  viewBacklogPage: ViewBacklogPage
}
