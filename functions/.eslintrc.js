module.exports = {
    root: true,
    env: {
        es6: true,
        node: true
    },
    extends: [
        `eslint:recommended`,
        `plugin:import/errors`,
        `plugin:import/warnings`,
        `plugin:import/typescript`,
        `plugin:@typescript-eslint/recommended`,
        `prettier`
    ],
    parser: `@typescript-eslint/parser`,
    // parserOptions: {
    //   project: ["tsconfig.json", "tsconfig.dev.json"],
    //   sourceType: "module",
    // },
    ignorePatterns: [
        `/lib/**/*` // Ignore built files.
    ],
    plugins: [
        `node`,
        `@typescript-eslint`,
        `import`
    ],
    rules: {
        'quotes': [`error`, `backtick`],
        'semi': [`error`, `never`],
        'semi-spacing': [`error`, { 'after': true, 'before': false }],
        'semi-style': [`error`, `last`],
        'no-extra-semi': `error`,
        'no-unexpected-multiline': `error`,
        'no-unreachable': `error`,
        'indent': [`error`, 4],
        'no-multi-spaces': [`error`, { exceptions: { 'Property': false } }],
        'max-len': [`error`, 160],
        'import/no-unresolved': `off`,
        'no-irregular-whitespace': `error`,
        'object-curly-spacing': [`error`, `always`],
        'comma-dangle': [`error`, `never`],
        'no-debugger': `off`,

        // `export` functions may be listed first.
        '@typescript-eslint/no-use-before-define': [
            `error`,
            { functions: true, classes: false, variables: true }
        ],

        // To read environment variables.
        '@typescript-eslint/no-non-null-assertion': `off`,

        // Disable the eslint side because it conflicts with the prettier.
        '@typescript-eslint/indent': `off`,

        // Parameter functions return type is obvious and need not to be explicit.
        '@typescript-eslint/explicit-function-return-type': [
            `error`,
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true
            }
        ]
    }
}
