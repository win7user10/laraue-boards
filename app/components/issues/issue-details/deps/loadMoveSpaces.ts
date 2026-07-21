type LoadMoveSpacesResult = {
  spaces: Array<{ label: string; value: string }>
}

export type LoadMoveSpacesError = 'AccessDenied' | 'TemporarilyUnavailable'

export type LoadMoveSpaces = () => Promise<
  ActionResult<LoadMoveSpacesResult, LoadMoveSpacesError>
>
