import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  stylistic: true,
  formatters: {
    css: 'prettier',
  },
  rules: {
    'no-undef': 'off',
  },
})
