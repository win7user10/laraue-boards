import type { ApiClient } from '#infrastructure/api/client'
import { createIssueListDeps } from '~/components/issue-list/deps/impl'

import type { IssuesPageDeps } from '..'
import { createSearchIssues } from './searchIssues'
import { createViewIssues } from './viewIssues'

export const createIssuesPageDeps = (client: ApiClient): IssuesPageDeps => ({
  issueList: createIssueListDeps(client),
  searchIssues: createSearchIssues(client),
  view: createViewIssues(client),
})
