export const mapIssueStatuses = (
  statuses: Array<{
    id: number | string
    name: string
    sortOrder: number | string
  }>,
) =>
  statuses
    .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
    .map((status) => ({ id: String(status.id), name: status.name }))
