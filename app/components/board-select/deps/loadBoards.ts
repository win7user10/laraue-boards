import type { Result } from '~/utils/actionResult'

export type BoardSelectOption = {
  label: string
  value: string
}

export type BoardSelectDeps = {
  loadBoards: (input: { spaceId: string }) => Promise<Result<BoardSelectOption[]>>
}
