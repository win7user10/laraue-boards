import type { IssueDetailsDeps } from '~/components/issues/issue-details/IssueDetailsDeps'
import type { DeleteIssue } from '~/sections/boards/board/components/IssueDialog/deps/deleteIssue'
import type { LoadIssue } from '~/sections/boards/board/components/IssueDialog/deps/loadIssue'
import type { MoveIssue } from '~/sections/boards/board/components/IssueDialog/deps/moveIssue'
import type { UpdateIssue } from '~/sections/boards/board/components/IssueDialog/deps/updateIssue'

export type IssueDialogDeps = {
  deleteIssue: DeleteIssue
  issueDetails: IssueDetailsDeps
  loadIssue: LoadIssue
  moveIssue: MoveIssue
  updateIssue: UpdateIssue
}
