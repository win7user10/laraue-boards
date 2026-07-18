type IssueAttribute = { id: string; type: 'list' | 'text' }

export function getIssueAttributeValueInput(
  values: Record<string, string>,
  attributes: IssueAttribute[],
) {
  return attributes.flatMap((attribute) => {
    const value = values[attribute.id]?.trim()
    if (!value) {
      return []
    }
    return [
      attribute.type === 'text'
        ? { attributeId: attribute.id, type: 'text' as const, value }
        : { attributeId: attribute.id, type: 'list' as const, valueId: value },
    ]
  })
}
