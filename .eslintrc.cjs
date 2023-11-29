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
		// ESLint rules: https://eslint.org/docs/latest/rules/
		// Based off of: https://github.com/eslint/eslint/blob/v8.54.0/packages/js/src/configs/eslint-recommended.js
		"constructor-super": 1, // Require `super()` calls in constructors
		"curly": 1, // Enforce consistent brace style for all control statements
		"for-direction": 1, // Enforce “for” loop update clause moving the counter in the right direction
		"getter-return": 1, // Enforce `return` statements in getters
		"no-async-promise-executor": 1, // Disallow using an async function as a Promise executor
		"no-case-declarations": 1, // Disallow lexical declarations in case clauses
		"no-class-assign": 1, // Disallow reassigning class members
		"no-compare-neg-zero": 1, // Disallow comparing against -0
		"no-const-assign": 1, // Disallow reassigning `const` variables
		"no-constant-condition": 1, // Disallow constant expressions in conditions
		"no-control-regex": 1, // Disallow control characters in regular expressions
		"no-debugger": 1, // Disallow the use of `debugger`
		"no-delete-var": 1, // Disallow deleting variables
		"no-dupe-args": 1, // Disallow duplicate arguments in `function` definitions
		"no-dupe-class-members": 1, // Disallow duplicate class members
		"no-dupe-else-if": 1, // Disallow duplicate conditions in if-else-if chains
		"no-dupe-keys": 1, // Disallow duplicate keys in object literals
		"no-duplicate-case": 1, // Disallow duplicate case labels
		"no-empty-character-class": 1, // Disallow empty character classes in regular expressions
		"no-empty-pattern": 1, // Disallow empty destructuring patterns
		"no-ex-assign": 1, // Disallow reassigning exceptions in `catch` clauses
		"no-extra-boolean-cast": 1, // Disallow unnecessary boolean casts
		"no-fallthrough": 1, // Disallow fallthrough of `case` statements
		"no-func-assign": 1, // Disallow reassigning `function` declarations
		"no-global-assign": 1, // Disallow assignments to native objects or read-only global variables
		"no-import-assign": 1, // Disallow assigning to imported bindings
		"no-inner-declarations": 1, // Disallow variable or `function` declarations in nested blocks
		"no-invalid-regexp": 1, // Disallow invalid regular expression strings in `RegExp` constructors
		"no-irregular-whitespace": 1, // Disallow irregular whitespace
		"no-misleading-character-class": 1, // Disallow characters which are made with multiple code points in character class syntax
		"no-new-symbol": 1, // Disallow `new` operators with the `Symbol` object
		"no-nonoctal-decimal-escape": 1, // Disallow `\8` and `\9` escape sequences in string literals
		"no-obj-calls": 1, // Disallow calling global object properties as functions
		"no-octal": 1, // Disallow octal literals
		"no-prototype-builtins": 1, // Disallow calling some `Object.prototype` methods directly on objects
		"no-regex-spaces": 1, // Disallow multiple spaces in regular expressions
		"no-self-assign": 1, // Disallow assignments where both sides are exactly the same
		"no-shadow-restricted-names": 1, // Disallow identifiers from shadowing restricted names
		"no-this-before-super": 1, // Disallow `this`/`super` before calling `super()` in constructors
		"no-undef": 1, // Disallow the use of undeclared variables unless mentioned in `/*global */` comments
		"no-unexpected-multiline": 1, // Disallow confusing multiline expressions
		"no-unreachable": 1, // Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements
		"no-unsafe-finally": 1, // Disallow control flow statements in `finally` blocks
		"no-unsafe-negation": 1, // Disallow negating the left operand of relational operators
		"no-unsafe-optional-chaining": 1, // Disallow use of optional chaining in contexts where the `undefined` value is not allowed
		"no-unused-labels": 1, // Disallow unused labels
		"no-useless-backreference": 1, // Disallow useless backreferences in regular expressions
		"no-useless-call": 1, // Disallow unnecessary calls to `.call()` and `.apply()`
		"no-useless-catch": 1, // Disallow unnecessary `catch` clauses
		"no-useless-escape": 1, // Disallow unnecessary escape characters
		"no-with": 1, // Disallow `with` statements
		"require-yield": 1, // Require generator functions to contain `yield`
		"use-isnan": 1, // Require calls to `isNaN()` when checking for `NaN`
		"valid-typeof": 1, // Enforce comparing `typeof` expressions against valid strings

		// ESLint Stylistic rules: https://eslint.style/packages/default#rules
		"@stylistic/arrow-spacing": 1, // Enforce consistent spacing before and after the arrow in arrow functions
		"@stylistic/brace-style": [1, "stroustrup"], // Enforce consistent brace style for blocks
		"@stylistic/comma-spacing": 1, // Enforce consistent spacing before and after commas
		"@stylistic/eol-last": 1, // Require newline at the end of files
		"@stylistic/indent": [1, "tab", { "SwitchCase": 1, "outerIIFEBody": 0 }], // Enforce consistent indentation
		"@stylistic/keyword-spacing": 1, // Enforce consistent spacing before and after keywords
		"@stylistic/no-extra-semi": 1, // Disallow unnecessary semicolons
		"@stylistic/no-mixed-spaces-and-tabs": [1, "smart-tabs"], // Disallow mixed spaces and tabs for indentation
		"@stylistic/no-trailing-spaces": 1, // Disallow trailing whitespace at the end of lines
		// Enforce the consistent use of double quotes
		"@stylistic/quotes": [
			1,
			"double",
			{ "avoidEscape": true, "allowTemplateLiterals": true },
		],
		"@stylistic/semi": 1, // Require semicolons instead of ASI
		"@stylistic/space-before-function-paren": 1, // Enforce consistent spacing before `function` definition opening parenthesis
		// Enforce consistent spacing after the `//` or `/*` in a comment
		"@stylistic/spaced-comment": [
			1,
			"always",
			{ "block": { "exceptions": ["*"] } },
		],

		// typescript-eslint rules: https://typescript-eslint.io/rules/
		// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/recommended.ts
		"@typescript-eslint/ban-ts-comment": 1, // Disallow `@ts-<directive>` comments
		"@typescript-eslint/ban-types": 1, // Disallow certain built-in types
		"@typescript-eslint/no-array-constructor": 1, // Disallow generic `Array` constructors
		"@typescript-eslint/no-duplicate-enum-values": 1, // Disallow duplicate enum member values
		"@typescript-eslint/no-extra-non-null-assertion": 1, // Disallow extra non-null assertions
		"@typescript-eslint/no-misused-new": 1, // Enforce valid definition of `new` and `constructor`
		"@typescript-eslint/no-namespace": 1, // Disallow TypeScript namespaces
		"@typescript-eslint/no-non-null-asserted-optional-chain": 1, // Disallow non-null assertions after an optional chain expression
		"@typescript-eslint/no-this-alias": 1, // Disallow aliasing `this`
		"@typescript-eslint/no-unnecessary-type-constraint": 1, // Disallow unnecessary constraints on generic types
		"@typescript-eslint/no-unsafe-declaration-merging": 1, // Disallow unsafe declaration merging
		"@typescript-eslint/no-var-requires": 1, // Disallow `require` statements except in import statements
		"@typescript-eslint/prefer-as-const": 1, // Enforce the use of `as const` over literal type
		"@typescript-eslint/triple-slash-reference": 1, // Disallow certain triple slash directives in favor of ES6-style import declarations

		// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/stylistic.ts
		"@typescript-eslint/adjacent-overload-signatures": 1, // Require that function overload signatures be consecutive
		"@typescript-eslint/array-type": 1, // Require consistently using `T[]` for arrays instead of `Array<T>`
		"@typescript-eslint/ban-tslint-comment": 1, // Disallow `// tslint:<rule-flag>` comments
		"@typescript-eslint/class-literal-property-style": 1, // Enforce that literals on classes are exposed in a consistent style
		"@typescript-eslint/consistent-generic-constructors": 1, // Enforce specifying generic type arguments on type annotation or constructor name of a constructor call
		"@typescript-eslint/consistent-indexed-object-style": 1, // Require the `Record` type instead of index signatures
		"@typescript-eslint/consistent-type-assertions": 1, // Enforce consistent usage of type assertions
		"@typescript-eslint/consistent-type-definitions": 1, // Enforce type definitions to consistently use `interface` instead of `type`
		"@typescript-eslint/no-confusing-non-null-assertion": 1, // Disallow non-null assertion in locations that may be confusing
		"@typescript-eslint/no-empty-interface": 1, // Disallow the declaration of empty interfaces
		"@typescript-eslint/no-inferrable-types": 1, // Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean
		"@typescript-eslint/prefer-for-of": 1, // Enforce the use of `for-of` loop over the standard `for` loop where possible
		"@typescript-eslint/prefer-function-type": 1, // Enforce using function types instead of interfaces with call signatures
		"@typescript-eslint/prefer-namespace-keyword": 1, // Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules
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
