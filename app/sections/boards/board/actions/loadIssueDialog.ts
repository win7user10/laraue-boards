import type { IssueDialogViewModel } from '../view/components/IssueDialog/IssueDialog.vue'

type LoadIssueDialogResult = { IssueDialog: IssueDialogViewModel }
type LoadIssueDialogError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueDialog = (input: {
  issueKey: string
}) => Promise<ActionResult<LoadIssueDialogResult, LoadIssueDialogError>>
