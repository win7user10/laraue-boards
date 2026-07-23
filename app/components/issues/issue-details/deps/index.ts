import type { LoadAssignees } from './loadAssignees'
import type { LoadMoveBoards } from './loadMoveBoards'
import type { LoadMoveSpaces } from './loadMoveSpaces'
import type { LoadStatuses } from './loadStatuses'
import type { SaveIssue } from './saveIssue'

export type { IssueDetailsSavedIssue, SaveIssueFailure } from './saveIssue'

export type IssueDetailsDeps = {
  loadAssignees: LoadAssignees
  loadMoveBoards: LoadMoveBoards
  loadMoveSpaces: LoadMoveSpaces
  loadStatuses: LoadStatuses
  saveIssue: SaveIssue
}
