type LoadIssueDialogAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
}

type LoadIssueDialogAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueDialogAssignees = (input: {
  spaceId: string
}) => Promise<
  ActionResult<LoadIssueDialogAssigneesResult, LoadIssueDialogAssigneesError>
>
