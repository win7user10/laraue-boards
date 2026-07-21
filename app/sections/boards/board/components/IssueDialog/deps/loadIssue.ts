import type { IssueDialogViewModel } from '~/sections/boards/board/components/IssueDialog/IssueDialog.vue'

type LoadIssueResult = { IssueDialog: IssueDialogViewModel }
type LoadIssueError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssue = (input: {
  issueKey: string
}) => Promise<ActionResult<LoadIssueResult, LoadIssueError>>
