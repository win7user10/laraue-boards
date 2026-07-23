import type { ApiClient } from '#infrastructure/api/client'

import type { IssueDetailsDeps } from '..'
import { createLoadAssignees } from './loadAssignees'
import { createLoadMoveBoards } from './loadMoveBoards'
import { createLoadMoveSpaces } from './loadMoveSpaces'
import { createLoadStatuses } from './loadStatuses'
import { createSaveIssue } from './saveIssue'

export const createIssueDetailsDeps = (client: ApiClient): IssueDetailsDeps => ({
  loadAssignees: createLoadAssignees(client),
  loadMoveBoards: createLoadMoveBoards(client),
  loadMoveSpaces: createLoadMoveSpaces(client),
  loadStatuses: createLoadStatuses(client),
  saveIssue: createSaveIssue(client),
})
