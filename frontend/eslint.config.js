import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // 🔕 Disable unnecessary React rules
      'react/jsx-no-target-blank': 'off',
      'react/react-in-jsx-scope': 'off', // not needed in React 17+
      'react/prop-types': 'off', // if you're using TypeScript or prefer not using prop-types
      'react/no-unescaped-entities': 'off', // disable warning for stuff like apostrophes
      'react/display-name': 'off', // optional: useful only for debugging HOCs

      // 🚧 React Refresh config
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    }
  },
]
