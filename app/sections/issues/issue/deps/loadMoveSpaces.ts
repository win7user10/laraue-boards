import type { IssueMoveOption } from '~/sections/issues/issue/IssuePage.types'
import type { Result } from '~/utils/actionResult'

export type LoadMoveSpaces = () => Promise<Result<IssueMoveOption[]>>
