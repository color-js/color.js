module.exports = {
	"root": true,
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
		"ecmaFeatures": {
			"impliedStrict": true,
		},
	},
	"env": {
		"browser": true,
		"es6": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@stylistic/disable-legacy",
	],
	"plugins": ["@typescript-eslint", "@stylistic"],
	"rules": {
		// Override recommended ESLint rules
		// https://eslint.org/docs/latest/rules/
		"no-cond-assign": 0,
		"no-empty": 0,
		"no-redeclare": 0,
		"no-setter-return": 0,
		"no-sparse-arrays": 0,

		// Enable additional ESLint rules
		"curly": 1,
		"no-useless-call": 1,

		// Override recommended typescript-eslint rules
		// https://typescript-eslint.io/rules/
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-loss-of-precision": 0,
		"@typescript-eslint/no-unused-vars": 0,

		// Enable ESLint Stylistic rules
		// https://eslint.style/packages/default#rules
		"@stylistic/arrow-spacing": 1,
		"@stylistic/brace-style": [1, "stroustrup"],
		"@stylistic/comma-spacing": 1,
		"@stylistic/eol-last": 1,
		"@stylistic/indent": [1, "tab", { "SwitchCase": 1, "outerIIFEBody": 0 }],
		"@stylistic/keyword-spacing": 1,
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
	},
	"overrides": [
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
				"@typescript-eslint/no-var-requires": 0,
			},
		},
		{
			"files": ["types/test/**/*"],
			"rules": {
				"@typescript-eslint/ban-ts-comment": 0,
			},
		},
	],
};
