import type { IssueDetailsViewModel } from '~/components/issues/issue-details/IssueDetails.vue'
import type { Result } from '~/utils/actionResult'

export type IssuePageData = IssueDetailsViewModel

export type IssueResourceFailure =
  | { type: 'accessDenied' }
  | { type: 'issueNotFound' }
  | { type: 'temporarilyUnavailable' }

export type LoadSpaceFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type LoadBoardFailure =
  | { type: 'accessDenied' }
  | { type: 'boardNotFound' }
  | { type: 'temporarilyUnavailable' }

export type MoveIssueFailure =
  | { type: 'accessDenied' }
  | { type: 'invalidStatus' }
  | { type: 'resourceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type UpdateIssueFailure = IssueResourceFailure | { message: string; type: 'invalidInput' }

export type IssuePageDeps = {
  deleteIssue: (input: { issueKey: string }) => Promise<Result<void, IssueResourceFailure>>
  loadAssignees: (input: { spaceId: string }) => Promise<
    Result<
      {
        assignees: Array<{
          color: string
          initials: string
          label: string
          value: string
        }>
      },
      LoadSpaceFailure
    >
  >
  loadMoveBoards: (input: {
    spaceId: string
  }) => Promise<Result<{ boards: Array<{ label: string; value: string }> }, LoadSpaceFailure>>
  loadMoveSpaces: () => Promise<
    Result<
      { spaces: Array<{ label: string; value: string }> },
      Exclude<LoadSpaceFailure, { type: 'spaceNotFound' }>
    >
  >
  loadStatuses: (input: {
    boardId: string
  }) => Promise<Result<{ statuses: Array<{ id: string; name: string }> }, LoadBoardFailure>>
  moveIssue: (input: {
    issueKey: string
    statusId: string
  }) => Promise<Result<void, MoveIssueFailure>>
  updateIssue: (input: {
    assigneeId: string
    attributeValues: Array<
      | { attributeId: string; type: 'list'; valueId: string }
      | { attributeId: string; type: 'text'; value: string }
    >
    content: string
    files: File[]
    issueKey: string
    removeAttachmentIds: string[]
  }) => Promise<Result<void, UpdateIssueFailure>>
  view: (input: {
    issueKey: string
    signal?: AbortSignal
  }) => Promise<Result<IssuePageData, IssueResourceFailure>>
}
