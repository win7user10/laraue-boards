import type { ApiClient } from '#infrastructure/api/client'
import { createBoardSelectDeps } from '~/components/board-select/deps/impl'
import { createSpaceSelectDeps } from '~/components/space-select/deps/impl'
import { createStatusSelectDeps } from '~/components/status-select/deps/impl'

import type { MoveIssuesDialogDeps } from '..'
import { createMoveIssues } from './moveIssues'

export const createMoveIssuesDialogDeps = (client: ApiClient): MoveIssuesDialogDeps => ({
  boardSelect: createBoardSelectDeps(client),
  moveIssues: createMoveIssues(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
