import type { AssigneeSelectDeps } from '~/components/assignee-select/deps'
import type { BoardSelectDeps } from '~/components/board-select/deps'
import type { SpaceSelectDeps } from '~/components/space-select/deps'
import type { StatusSelectDeps } from '~/components/status-select/deps'

import type { SaveIssue } from './saveIssue'

export type { IssueDetailsSavedIssue, SaveIssueFailure } from './saveIssue'

export type IssueDetailsDeps = {
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  saveIssue: SaveIssue
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
