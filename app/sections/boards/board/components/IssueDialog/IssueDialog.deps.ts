import type { IssueDetailsViewModel } from '~/components/issues/issue-details/IssueDetails.vue'
import type { Result } from '~/utils/actionResult'

type Failure<Type extends string> = Type extends string ? { type: Type } : never

export type IssueDialogViewModel = IssueDetailsViewModel

export type IssueFailure = Failure<'accessDenied' | 'issueNotFound' | 'temporarilyUnavailable'>

export type SpaceLookupFailure = Failure<
  'accessDenied' | 'spaceNotFound' | 'temporarilyUnavailable'
>

export type MoveSpacesFailure = Failure<'accessDenied' | 'temporarilyUnavailable'>

export type BoardLookupFailure = Failure<
  'accessDenied' | 'boardNotFound' | 'temporarilyUnavailable'
>

export type MoveIssueFailure = Failure<
  'accessDenied' | 'invalidStatus' | 'resourceNotFound' | 'temporarilyUnavailable'
>

export type UpdateIssueFailure = IssueFailure | { message: string; type: 'invalidInput' }

export type MoveIssue = (input: {
  issueKey: string
  statusId: string
}) => Promise<Result<null, MoveIssueFailure>>

export type IssueDialogDeps = {
  deleteIssue: (input: { issueKey: string }) => Promise<Result<null, IssueFailure>>
  issueDetails: {
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
        SpaceLookupFailure
      >
    >
    loadMoveBoards: (input: {
      spaceId: string
    }) => Promise<Result<{ boards: Array<{ label: string; value: string }> }, SpaceLookupFailure>>
    loadMoveSpaces: () => Promise<
      Result<{ spaces: Array<{ label: string; value: string }> }, MoveSpacesFailure>
    >
    loadStatuses: (input: {
      boardId: string
    }) => Promise<Result<{ statuses: Array<{ id: string; name: string }> }, BoardLookupFailure>>
  }
  loadIssue: (input: {
    issueKey: string
  }) => Promise<Result<{ IssueDialog: IssueDialogViewModel }, IssueFailure>>
  moveIssue: MoveIssue
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
  }) => Promise<Result<null, UpdateIssueFailure>>
}
