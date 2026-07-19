export const mapMoveOptions = (
  items: Array<{ id: number | string; name: string }>,
) => items.map((item) => ({ label: item.name, value: String(item.id) }))
