export const COLORS = {
  amber: '#c99724',
  blue: '#4774d4',
  coral: '#df725c',
  cyan: '#3295b5',
  emerald: '#319378',
  gray: '#98a2b3',
  green: '#489c61',
  indigo: '#5d60ca',
  lime: '#79a948',
  orange: '#dc8735',
  pink: '#c65f98',
  purple: '#8a5fc1',
  red: '#d65f63',
  rose: '#cf637f',
  sky: '#438bc7',
  teal: '#338f91',
} as const

export const DEFAULT_COLOR = COLORS.blue

export const COLOR_PALETTE = [
  { name: 'Gray', value: COLORS.gray },
  { name: 'Amber', value: COLORS.amber },
  { name: 'Orange', value: COLORS.orange },
  { name: 'Coral', value: COLORS.coral },
  { name: 'Red', value: COLORS.red },
  { name: 'Rose', value: COLORS.rose },
  { name: 'Lime', value: COLORS.lime },
  { name: 'Green', value: COLORS.green },
  { name: 'Emerald', value: COLORS.emerald },
  { name: 'Teal', value: COLORS.teal },
  { name: 'Cyan', value: COLORS.cyan },
  { name: 'Sky', value: COLORS.sky },
  { name: 'Blue', value: COLORS.blue },
  { name: 'Indigo', value: COLORS.indigo },
  { name: 'Purple', value: COLORS.purple },
  { name: 'Pink', value: COLORS.pink },
] as const
