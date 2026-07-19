// stylelint.config.mjs
export default {
  overrides: [
    {
      customSyntax: 'postcss-html',
      files: ['**/*.vue'],
    },
  ],
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-alphabetical-order': true,
  },
}
