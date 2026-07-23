import type { ApiClient } from '#infrastructure/api/client'
import { createAssigneeSelectDeps } from '~/components/assignee-select/deps/impl'
import { createBoardSelectDeps } from '~/components/board-select/deps/impl'
import { createSpaceSelectDeps } from '~/components/space-select/deps/impl'
import { createStatusSelectDeps } from '~/components/status-select/deps/impl'

import type { IssueDetailsDeps } from '..'
import { createSaveIssue } from './saveIssue'

export const createIssueDetailsDeps = (client: ApiClient): IssueDetailsDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),
  saveIssue: createSaveIssue(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
