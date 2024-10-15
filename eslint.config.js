import pluginJs from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'

export default [
    pluginJs.configs.recommended,
    perfectionist.configs['recommended-alphabetical'],
    {
        files: ['**/*.config.js', '*.js'],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            semi: 'off',
        },
    },
    {
        files: ['**/*.js'],
        ignores: ['**/*.config.js', 'node_modules/**'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
            },
        },
        rules: {
            semi: 'off',
        },
    },
]
