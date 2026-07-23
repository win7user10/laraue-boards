import type { ApiClient } from '#infrastructure/api/client'
import { createIssueDetailsDeps } from '~/components/issue-details/deps/impl'

import type { IssuePageDeps } from '..'
import { createDeleteIssue } from './deleteIssue'
import { createViewIssue } from './viewIssue'

export const createIssuePageDeps = (client: ApiClient): IssuePageDeps => ({
  deleteIssue: createDeleteIssue(client),
  issueDetails: createIssueDetailsDeps(client),
  view: createViewIssue(client),
})
