export type IssueAttributeField =
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }
  | {
      color: string
      id: string
      name: string
      type: 'text'
    }
