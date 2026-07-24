import type { BoardSelectDeps } from '~/components/board-select/deps'
import type { SpaceSelectDeps } from '~/components/space-select/deps'
import type { StatusSelectDeps } from '~/components/status-select/deps'

import type { MoveIssues } from './moveIssues'

export type MoveIssuesDialogDeps = {
  boardSelect: BoardSelectDeps
  moveIssues: MoveIssues
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
