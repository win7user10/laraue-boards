import type { LoadMoveBoards } from '~/components/issues/issue-list/deps/loadMoveBoards'
import type { LoadMoveSpaces } from '~/components/issues/issue-list/deps/loadMoveSpaces'
import type { LoadMoveStatuses } from '~/components/issues/issue-list/deps/loadMoveStatuses'
import type { MoveIssues } from '~/components/issues/issue-list/deps/moveIssues'

export type IssueListDeps = {
  loadMoveBoards: LoadMoveBoards
  loadMoveSpaces: LoadMoveSpaces
  loadMoveStatuses: LoadMoveStatuses
  moveIssues: MoveIssues
}
