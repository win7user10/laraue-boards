type LoadIssueMoveSpacesResult = {
  spaces: Array<{ label: string; value: string }>
}

type LoadIssueMoveSpacesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type LoadIssueMoveSpaces = () => Promise<
  ActionResult<LoadIssueMoveSpacesResult, LoadIssueMoveSpacesError>
>
