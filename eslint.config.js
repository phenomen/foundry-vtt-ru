import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  stylistic: true,
  formatters: {
    css: true,
  },
  rules: {
    'no-undef': 'off',
  },
})
