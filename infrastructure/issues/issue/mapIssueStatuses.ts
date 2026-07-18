export const mapIssueStatuses = (
  statuses: Array<{ id: number | string; name: string }>,
) => statuses.map((status) => ({ id: String(status.id), name: status.name }))
