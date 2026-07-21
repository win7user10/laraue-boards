import type { LoadAssignees } from '~/components/issues/issue-details/deps/loadAssignees'
import type { LoadMoveBoards } from '~/components/issues/issue-details/deps/loadMoveBoards'
import type { LoadMoveSpaces } from '~/components/issues/issue-details/deps/loadMoveSpaces'
import type { LoadStatuses } from '~/components/issues/issue-details/deps/loadStatuses'

export type IssueDetailsDeps = {
  loadAssignees: LoadAssignees
  loadMoveBoards: LoadMoveBoards
  loadMoveSpaces: LoadMoveSpaces
  loadStatuses: LoadStatuses
}
