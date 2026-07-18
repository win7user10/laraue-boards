export const getFirstStatusId = (
  statuses: Array<{ id: number | string; sortOrder: number | string }>,
) =>
  statuses.length
    ? String(
        statuses.reduce((first, status) =>
          Number(status.sortOrder) < Number(first.sortOrder) ? status : first,
        ).id,
      )
    : null
