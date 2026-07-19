type LoadBacklogMoveSpacesResult = {
  spaces: Array<{ label: string; value: string }>
}

type LoadBacklogMoveSpacesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type LoadBacklogMoveSpaces = () => Promise<
  ActionResult<LoadBacklogMoveSpacesResult, LoadBacklogMoveSpacesError>
>
