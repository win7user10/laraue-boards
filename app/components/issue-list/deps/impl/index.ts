import type { ApiClient } from '#infrastructure/api/client'

import type { IssueListDeps } from '..'
import { createMoveIssuesDialogDeps } from '../../components/move-issues-dialog/deps/impl'

export const createIssueListDeps = (client: ApiClient): IssueListDeps => ({
  moveIssuesDialog: createMoveIssuesDialogDeps(client),
})
