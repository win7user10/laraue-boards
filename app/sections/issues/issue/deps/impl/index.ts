import type { ApiClient } from '#infrastructure/api/client'

import type { IssuePageDeps } from '..'
import { createDeleteIssue } from './deleteIssue'
import { createLoadAssignees } from './loadAssignees'
import { createLoadMoveBoards } from './loadMoveBoards'
import { createLoadMoveSpaces } from './loadMoveSpaces'
import { createLoadStatuses } from './loadStatuses'
import { createMoveIssue } from './moveIssue'
import { createUpdateIssue } from './updateIssue'
import { createViewIssue } from './viewIssue'

export const createIssuePageDeps = (client: ApiClient): IssuePageDeps => ({
  deleteIssue: createDeleteIssue(client),
  loadAssignees: createLoadAssignees(client),
  loadMoveBoards: createLoadMoveBoards(client),
  loadMoveSpaces: createLoadMoveSpaces(client),
  loadStatuses: createLoadStatuses(client),
  moveIssue: createMoveIssue(client),
  updateIssue: createUpdateIssue(client),
  view: createViewIssue(client),
})
