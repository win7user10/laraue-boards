import type { ViewBoardPageResult } from '../../../app/sections/boards/board/actions/viewBoardPage'
import type { components } from '../../api/generated.ts'

type Schemas = components['schemas']

export function mapViewBoardPage(
  boardId: string,
  epic: Schemas['EpicDto'],
  columnIssues: Schemas['ColumnIssues'][],
  attributes: ViewBoardPageResult['BoardPage']['attributes'] = [],
): ViewBoardPageResult {
  const boardIssues = mapBoardIssues(columnIssues).BoardPage
  const issuesByStatus = new Map(
    boardIssues.columns.map((column) => [column.id, column]),
  )

  return {
    BoardPage: {
      attributes,
      canCreateIssues: epic.canCreateIssues,
      canDelete: epic.canDelete ?? false,
      canMoveIssues: epic.canUpdateIssues,
      canUpdate: epic.canUpdate ?? false,
      color: epic.color ?? null,
      columns: (epic.statuses ?? [])
        .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
        .map((status) => {
          const column = issuesByStatus.get(String(status.id))
          return {
            color: status.color ?? null,
            hasNext: column?.hasNext ?? false,
            id: String(status.id),
            issueCount: column?.issueCount ?? 0,
            issues: column?.issues ?? [],
            title: status.name,
          }
        }),
      id: boardId,
      issueCount: boardIssues.issueCount,
      title: epic.name,
    },
  }
}

export function mapIssueListDto(issue: Schemas['IssueListDto']) {
  return {
    assigneeColor: issue.assigneeColor,
    assigneeInitial: issue.assigneeInitial ?? '?',
    assigneeName: issue.assignee,
    content: issue.content ?? '',
    issueKey: issue.key,
    time: issue.time,
  }
}

export function mapBoardIssues(columnIssues: Schemas['ColumnIssues'][]) {
  return {
    BoardPage: {
      columns: columnIssues.map((column) => ({
        hasNext: column.items.hasNext ?? false,
        id: String(column.statusId),
        issueCount: Number(column.items.totalCount ?? 0),
        issues: column.items.data.map(mapIssueListDto),
      })),
      issueCount: columnIssues.reduce(
        (sum, column) => sum + Number(column.items.totalCount ?? 0),
        0,
      ),
    },
  }
}
