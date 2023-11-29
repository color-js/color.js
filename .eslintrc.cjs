module.exports = {
	"root": true,
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"sourceType": "module",
		"ecmaFeatures": {
			"impliedStrict": true,
		},
	},
	"env": {
		"browser": true,
		"es2020": true,
	},
	"plugins": ["@typescript-eslint", "@stylistic"],
	"rules": {
		// ESLint rules
		// https://eslint.org/docs/latest/rules/
		// Based off of: https://github.com/eslint/eslint/blob/v8.54.0/packages/js/src/configs/eslint-recommended.js
		"constructor-super": 1,
		"curly": 1,
		"for-direction": 1,
		"getter-return": 1,
		"no-async-promise-executor": 1,
		"no-case-declarations": 1,
		"no-class-assign": 1,
		"no-compare-neg-zero": 1,
		"no-const-assign": 1,
		"no-constant-condition": 1,
		"no-control-regex": 1,
		"no-debugger": 1,
		"no-delete-var": 1,
		"no-dupe-args": 1,
		"no-dupe-class-members": 1,
		"no-dupe-else-if": 1,
		"no-dupe-keys": 1,
		"no-duplicate-case": 1,
		"no-empty-character-class": 1,
		"no-empty-pattern": 1,
		"no-ex-assign": 1,
		"no-extra-boolean-cast": 1,
		"no-fallthrough": 1,
		"no-func-assign": 1,
		"no-global-assign": 1,
		"no-import-assign": 1,
		"no-inner-declarations": 1,
		"no-invalid-regexp": 1,
		"no-irregular-whitespace": 1,
		"no-misleading-character-class": 1,
		"no-new-symbol": 1,
		"no-nonoctal-decimal-escape": 1,
		"no-obj-calls": 1,
		"no-octal": 1,
		"no-prototype-builtins": 1,
		"no-regex-spaces": 1,
		"no-self-assign": 1,
		"no-shadow-restricted-names": 1,
		"no-this-before-super": 1,
		"no-undef": 1,
		"no-unexpected-multiline": 1,
		"no-unreachable": 1,
		"no-unsafe-finally": 1,
		"no-unsafe-negation": 1,
		"no-unsafe-optional-chaining": 1,
		"no-unused-labels": 1,
		"no-useless-backreference": 1,
		"no-useless-call": 1,
		"no-useless-catch": 1,
		"no-useless-escape": 1,
		"no-with": 1,
		"require-yield": 1,
		"use-isnan": 1,
		"valid-typeof": 1,

		// ESLint Stylistic rules
		// https://eslint.style/packages/default#rules
		"@stylistic/arrow-spacing": 1,
		"@stylistic/brace-style": [1, "stroustrup"],
		"@stylistic/comma-spacing": 1,
		"@stylistic/eol-last": 1,
		"@stylistic/indent": [1, "tab", { "SwitchCase": 1, "outerIIFEBody": 0 }],
		"@stylistic/keyword-spacing": 1,
		"@stylistic/no-extra-semi": 1,
		"@stylistic/no-mixed-spaces-and-tabs": [1, "smart-tabs"],
		"@stylistic/no-trailing-spaces": 1,
		"@stylistic/quotes": [
			1,
			"double",
			{ "avoidEscape": true, "allowTemplateLiterals": true },
		],
		"@stylistic/semi": 1,
		"@stylistic/space-before-function-paren": 1,
		"@stylistic/spaced-comment": [
			1,
			"always",
			{ "block": { "exceptions": ["*"] } },
		],

		// typescript-eslint rules
		// https://typescript-eslint.io/rules/
		// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/recommended.ts
		"@typescript-eslint/ban-ts-comment": 1,
		"@typescript-eslint/ban-types": 1,
		"@typescript-eslint/no-array-constructor": 1,
		"@typescript-eslint/no-duplicate-enum-values": 1,
		"@typescript-eslint/no-extra-non-null-assertion": 1,
		"@typescript-eslint/no-misused-new": 1,
		"@typescript-eslint/no-namespace": 1,
		"@typescript-eslint/no-non-null-asserted-optional-chain": 1,
		"@typescript-eslint/no-this-alias": 1,
		"@typescript-eslint/no-unnecessary-type-constraint": 1,
		"@typescript-eslint/no-unsafe-declaration-merging": 1,
		"@typescript-eslint/no-var-requires": 1,
		"@typescript-eslint/prefer-as-const": 1,
		"@typescript-eslint/triple-slash-reference": 1,
		// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/stylistic.ts
		"@typescript-eslint/adjacent-overload-signatures": 1,
		"@typescript-eslint/array-type": 1,
		"@typescript-eslint/ban-tslint-comment": 1,
		"@typescript-eslint/class-literal-property-style": 1,
		"@typescript-eslint/consistent-generic-constructors": 1,
		"@typescript-eslint/consistent-indexed-object-style": 1,
		"@typescript-eslint/consistent-type-assertions": 1,
		"@typescript-eslint/consistent-type-definitions": 1,
		"@typescript-eslint/no-confusing-non-null-assertion": 1,
		"@typescript-eslint/no-empty-interface": 1,
		"@typescript-eslint/no-inferrable-types": 1,
		"@typescript-eslint/prefer-for-of": 1,
		"@typescript-eslint/prefer-function-type": 1,
		"@typescript-eslint/prefer-namespace-keyword": 1,
	},
	"overrides": [
		{
			// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/eslint-recommended.ts
			files: ["*.ts"],
			rules: {
				// Disable ESLint rules already handled by TypeScript
				"constructor-super": 0, // ts(2335) & ts(2377)
				"getter-return": 0, // ts(2378)
				"no-const-assign": 0, // ts(2588)
				"no-dupe-args": 0, // ts(2300)
				"no-dupe-class-members": 0, // ts(2393) & ts(2300)
				"no-dupe-keys": 0, // ts(1117)
				"no-func-assign": 0, // ts(2630)
				"no-import-assign": 0, // ts(2632) & ts(2540)
				"no-new-symbol": 0, // ts(7009)
				"no-obj-calls": 0, // ts(2349)
				"no-redeclare": 0, // ts(2451)
				"no-setter-return": 0, // ts(2408)
				"no-this-before-super": 0, // ts(2376) & ts(17009)
				"no-undef": 0, // ts(2304) & ts(2552)
				"no-unreachable": 0, // ts(7027)
				"no-unsafe-negation": 0, // ts(2365) & ts(2322) & ts(2358)

				// Enable ESLint rules that make sense in TypeScript files
				"no-var": 1, // ts transpiles let/const to var, so no need for vars any more
				"prefer-const": 1, // ts provides better types with const
				"prefer-rest-params": 1, // ts provides better types with rest args over arguments
				"prefer-spread": 1, // ts transpiles spread to apply, so no need for manual apply
			},
		},
		{
			"files": [
				"apps/**/*",
				"assets/**/*",
				"get/**/*",
				"notebook/**/*",
				"scripts/**/*",
				"tests/**/*",
			],
			"rules": {
				// These directories reference implicit global variables
				"no-undef": 0,
			},
		},
		{
			"files": ["*.cjs"],
			"env": {
				"browser": false,
				"node": true,
			},
			"rules": {
				// Allow `require()` usage in CJS files
				"@typescript-eslint/no-var-requires": 0,
			},
		},
		{
			"files": ["types/test/**/*"],
			"rules": {
				// Allow `@ts-expect-error` comments in TypeScript test files
				"@typescript-eslint/ban-ts-comment": 0,
			},
		},
	],
};
