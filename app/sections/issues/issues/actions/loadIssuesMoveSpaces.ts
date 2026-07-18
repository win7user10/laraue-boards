type LoadIssuesMoveSpacesResult = {
  spaces: Array<{ label: string; value: string }>
}

type LoadIssuesMoveSpacesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type LoadIssuesMoveSpaces = () => Promise<
  ActionResult<LoadIssuesMoveSpacesResult, LoadIssuesMoveSpacesError>
>
