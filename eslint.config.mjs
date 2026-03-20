import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	eslintConfigPrettier,
	eslintPluginPrettierRecommended,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
	{
		rules: {
			// typescript
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			// import
			'import/no-unresolved': 'off',
			'import/no-named-as-default': 'off',
			'import/order': [
				'error',
				{
					'groups': ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
					'newlines-between': 'always',
					'alphabetize': {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
			// custom
			'no-console': 'warn',
		},
	},
]);

export default eslintConfig;
