export const mapBacklogMoveBoards = (
  boards: Array<{ id: number | string; name: string }>,
  sourceBoardId: string,
) =>
  boards
    .filter((board) => String(board.id) !== sourceBoardId)
    .map((board) => ({ label: board.name, value: String(board.id) }))
