// Only Vue template style rules — oxlint can't lint Vue templates.
// Everything else (correctness, perfectionist, formatting) is oxlint + oxfmt.
import tsParser from '@typescript-eslint/parser'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['.nuxt/', '.output/', 'dist/', 'infrastructure/api/generated.ts'],
  },

  ...pluginVue.configs['flat/base'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tsParser },
    },
    rules: {
      'vue/attributes-order': [
        'error',
        {
          alphabetical: true,
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            'UNIQUE',
            'SLOT',
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT',
          ],
        },
      ],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': [
        'error',
        { defineExposeLast: true, order: ['defineProps', 'defineEmits'] },
      ],
      'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    },
  },
]
