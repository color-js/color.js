import eslintConfig from "@eslint/js";
import { configs as tseslintConfigs } from "typescript-eslint";
import * as globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

export default [
	{
		ignores: [
			"!.*",
			"assets/js/prism.js",
			"api/",
			"/dist/",
			"docs/",
			"types/src/",
		],
	},
	eslintConfig.configs.recommended,
	...tseslintConfigs.strict,
	{
		plugins: {
			"@stylistic": stylistic,
		},
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
	{
		rules: {
			/**
			 * ESLint rules: https://eslint.org/docs/latest/rules/
			 * Based off of: https://github.com/eslint/eslint/blob/v8.54.0/packages/js/src/configs/eslint-recommended.js
			 */
			// Require `super()` calls in constructors
			// https://eslint.org/docs/latest/rules/constructor-super
			"constructor-super": 1,
			// Enforce curly braces for all control statements
			// https://eslint.org/docs/latest/rules/curly
			"curly": 1,
			// Enforce “for” loop update clause moving the counter in the right direction
			// https://eslint.org/docs/latest/rules/for-direction
			"for-direction": 1,
			// Enforce `return` statements in getters
			// https://eslint.org/docs/latest/rules/getter-return
			"getter-return": 1,
			// Disallow using an async function as a Promise executor
			// https://eslint.org/docs/latest/rules/no-async-promise-executor
			"no-async-promise-executor": 1,
			// Disallow `let`/const`/function`/`class` in `case`/`default` clauses
			// https://eslint.org/docs/latest/rules/no-case-declarations
			"no-case-declarations": 1,
			// Disallow reassigning class members
			// https://eslint.org/docs/latest/rules/no-class-assign
			"no-class-assign": 1,
			// Disallow comparing against -0
			// https://eslint.org/docs/latest/rules/no-compare-neg-zero
			"no-compare-neg-zero": 1,
			// Disallow reassigning `const` variables
			// https://eslint.org/docs/latest/rules/no-const-assign
			"no-const-assign": 1,
			// Disallow constant expressions in conditions
			// https://eslint.org/docs/latest/rules/no-constant-condition
			"no-constant-condition": 1,
			// Disallow control characters in regular expressions
			// https://eslint.org/docs/latest/rules/no-control-regex
			"no-control-regex": 1,
			// Disallow the use of `debugger`
			// https://eslint.org/docs/latest/rules/no-debugger
			"no-debugger": 1,
			// Disallow deleting variables
			// https://eslint.org/docs/latest/rules/no-delete-var
			"no-delete-var": 1,
			// Disallow duplicate arguments in `function` definitions
			// https://eslint.org/docs/latest/rules/no-dupe-args
			"no-dupe-args": 1,
			// Disallow duplicate class members
			// https://eslint.org/docs/latest/rules/no-dupe-class-members
			"no-dupe-class-members": 1,
			// Disallow duplicate conditions in if-else-if chains
			// https://eslint.org/docs/latest/rules/no-dupe-else-if
			"no-dupe-else-if": 1,
			// Disallow duplicate keys in object literals
			// https://eslint.org/docs/latest/rules/no-dupe-keys
			"no-dupe-keys": 1,
			// Disallow duplicate case labels
			// https://eslint.org/docs/latest/rules/no-duplicate-case
			"no-duplicate-case": 1,
			// Allow empty blocks in catches
			"no-empty": [1, {allowEmptyCatch: true}],
			// Disallow empty character classes in regular expressions
			// https://eslint.org/docs/latest/rules/no-empty-character-class
			"no-empty-character-class": 1,
			// Disallow empty destructuring patterns
			// https://eslint.org/docs/latest/rules/no-empty-pattern
			"no-empty-pattern": 1,
			// Disallow reassigning exceptions in `catch` clauses
			// https://eslint.org/docs/latest/rules/no-ex-assign
			"no-ex-assign": 1,
			// Disallow unnecessary boolean casts
			// https://eslint.org/docs/latest/rules/no-extra-boolean-cast
			"no-extra-boolean-cast": 1,
			// Disallow fallthrough of `case` statements
			// unless marked with a comment that matches `/falls?\s?through/i` regex
			// https://eslint.org/docs/latest/rules/no-fallthrough
			"no-fallthrough": 1,
			// Disallow reassigning `function` declarations
			// https://eslint.org/docs/latest/rules/no-func-assign
			"no-func-assign": 1,
			// Disallow assignments to native objects or read-only global variables
			// https://eslint.org/docs/latest/rules/no-global-assign
			"no-global-assign": 1,
			// Disallow assigning to imported bindings
			// https://eslint.org/docs/latest/rules/no-import-assign
			"no-import-assign": 1,
			// Disallow invalid regular expression strings in `RegExp` constructors
			// https://eslint.org/docs/latest/rules/no-invalid-regexp
			"no-invalid-regexp": 1,
			// Disallow whitespace that is not `tab` or `space` except in string literals
			// https://eslint.org/docs/latest/rules/no-irregular-whitespace
			"no-irregular-whitespace": 1,
			// Allow lossy precision in numbers
			"no-loss-of-precision": 0,
			// Disallow characters which are made with multiple code points in character class syntax
			// https://eslint.org/docs/latest/rules/no-misleading-character-class
			"no-misleading-character-class": 1,
			// Disallow `new` operators with the `Symbol` object
			// https://eslint.org/docs/latest/rules/no-new-symbol
			"no-new-symbol": 1,
			// Disallow `\8` and `\9` escape sequences in string literals
			// https://eslint.org/docs/latest/rules/no-nonoctal-decimal-escape
			"no-nonoctal-decimal-escape": 1,
			// Disallow calling global object properties as functions
			// https://eslint.org/docs/latest/rules/no-obj-calls
			"no-obj-calls": 1,
			// Disallow octal literals
			// https://eslint.org/docs/latest/rules/no-octal
			"no-octal": 1,
			// Disallow calling some `Object.prototype` methods directly on objects
			// https://eslint.org/docs/latest/rules/no-prototype-builtins
			"no-prototype-builtins": 1,
			// Disallow multiple spaces in regular expressions
			// https://eslint.org/docs/latest/rules/no-regex-spaces
			"no-regex-spaces": 1,
			// Disallow assignments where both sides are exactly the same
			// https://eslint.org/docs/latest/rules/no-self-assign
			"no-self-assign": 1,
			// Disallow identifiers from shadowing restricted names
			// https://eslint.org/docs/latest/rules/no-shadow-restricted-names
			"no-shadow-restricted-names": 1,
			// Allow sparse arrays (e.g. `[, 1, 2]`)
			"no-sparse-arrays": 0,
			// Disallow `this`/`super` before calling `super()` in constructors
			// https://eslint.org/docs/latest/rules/no-this-before-super
			"no-this-before-super": 1,
			// Disallow the use of undeclared variables unless mentioned in `/*global */` comments
			// https://eslint.org/docs/latest/rules/no-undef
			// TODO: At-risk; subject to change.
			"no-undef": 0,
			// Disallow confusing multiline expressions
			// https://eslint.org/docs/latest/rules/no-unexpected-multiline
			// TODO: At-risk; subject to change.
			"no-unexpected-multiline": 1,
			// Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements
			// https://eslint.org/docs/latest/rules/no-unreachable
			"no-unreachable": 1,
			// Disallow control flow statements in `finally` blocks
			// https://eslint.org/docs/latest/rules/no-unsafe-finally
			"no-unsafe-finally": 1,
			// Disallow negating the left operand of relational operators
			// https://eslint.org/docs/latest/rules/no-unsafe-negation
			"no-unsafe-negation": 1,
			// Disallow use of optional chaining in contexts where the `undefined` value is not allowed
			// https://eslint.org/docs/latest/rules/no-unsafe-optional-chaining
			"no-unsafe-optional-chaining": 1,
			// Disallow unused labels
			// https://eslint.org/docs/latest/rules/no-unused-labels
			"no-unused-labels": 1,
			// Disallow useless backreferences in regular expressions
			// https://eslint.org/docs/latest/rules/no-useless-backreference
			"no-useless-backreference": 1,
			// Disallow unnecessary calls to `.call()` and `.apply()`
			// https://eslint.org/docs/latest/rules/no-useless-call
			"no-useless-call": 1,
			// Disallow unnecessary `catch` clauses
			// https://eslint.org/docs/latest/rules/no-useless-catch
			"no-useless-catch": 1,
			// Disallow unnecessary escape characters
			// https://eslint.org/docs/latest/rules/no-useless-escape
			"no-useless-escape": 1,
			// Disallow `with` statements
			// https://eslint.org/docs/latest/rules/no-with
			"no-with": 1,
			// Require generator functions to contain `yield`
			// https://eslint.org/docs/latest/rules/require-yield
			"require-yield": 1,
			// Require calls to `isNaN()` when checking for `NaN`
			// https://eslint.org/docs/latest/rules/use-isnan
			"use-isnan": 1,
			// Enforce comparing `typeof` expressions against valid strings
			// https://eslint.org/docs/latest/rules/valid-typeof
			"valid-typeof": 1,

			/**
			 * ESLint Stylistic rules: https://eslint.style/packages/default#rules
			 */
			// Enforce a space before and after `=>` in arrow functions
			// https://eslint.style/rules/default/arrow-spacing
			"@stylistic/arrow-spacing": 1,
			// Enforce consistent brace style for blocks
			// https://eslint.style/rules/default/brace-style
			"@stylistic/brace-style": [1, "stroustrup"],
			// Enforce trailing commas unless closing `]` or `}` is on the same line
			// https://eslint.style/rules/default/comma-dangle
			"@stylistic/comma-dangle": [1, "always-multiline"],
			// Enforce no space before and one or more spaces after a comma
			// https://eslint.style/rules/default/comma-spacing
			"@stylistic/comma-spacing": 1,
			// Require newline at the end of files
			// https://eslint.style/rules/default/eol-last
			"@stylistic/eol-last": 1,
			// Enforce consistent indentation
			// https://eslint.style/rules/default/indent
			"@stylistic/indent": [1, "tab", { "SwitchCase": 1, "outerIIFEBody": 0 }],
			// Enforce consistent spacing before and after keywords
			// https://eslint.style/rules/default/keyword-spacing
			"@stylistic/keyword-spacing": 1,
			// Disallow unnecessary semicolons
			// https://eslint.style/rules/default/no-extra-semi
			"@stylistic/no-extra-semi": 1,
			// Disallow mixed spaces and tabs for indentation
			// https://eslint.style/rules/default/no-mixed-spaces-and-tabs
			"@stylistic/no-mixed-spaces-and-tabs": [1, "smart-tabs"],
			// Disallow trailing whitespace at the end of lines
			// https://eslint.style/rules/default/no-trailing-spaces
			"@stylistic/no-trailing-spaces": 1,
			// Enforce the consistent use of double quotes
			// https://eslint.style/rules/default/quotes
			"@stylistic/quotes": [
				1,
				"double",
				{ "avoidEscape": true, "allowTemplateLiterals": true },
			],
			// Require semicolons instead of ASI
			// https://eslint.style/rules/default/semi
			"@stylistic/semi": 1,
			// Enforce at least one space before blocks
			// https://eslint.style/rules/default/space-before-blocks
			"@stylistic/space-before-blocks": 1,
			// Enforce a space before `function` definition opening parenthesis
			// https://eslint.style/rules/default/space-before-function-paren
			"@stylistic/space-before-function-paren": 1,
			// Require spaces around infix operators (e.g. `+`, `=`, `?`, `:`)
			// https://eslint.style/rules/default/space-infix-ops
			"@stylistic/space-infix-ops": 1,
			// Enforce a space after unary word operators (`new`, `delete`, `typeof`, `void`, `yield`)
			// https://eslint.style/rules/default/space-unary-ops
			"@stylistic/space-unary-ops": 1,
			// Enforce whitespace after the `//` or `/*` in a comment
			// https://eslint.style/rules/default/spaced-comment
			"@stylistic/spaced-comment": [
				1,
				"always",
				{ "block": { "exceptions": ["*"] } },
			],

			/**
			 * typescript-eslint rules: https://typescript-eslint.io/rules/
			 * Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/recommended.ts
			 */
			// Disallow `@ts-<directive>` comments
			// https://typescript-eslint.io/rules/ban-ts-comment
			"@typescript-eslint/ban-ts-comment": 1,
			// Disallow certain built-in types
			"@typescript-eslint/no-unsafe-function-type": 1,
			"@typescript-eslint/no-wrapper-object-types": 1,
			// Disallow generic `Array` constructors
			// https://typescript-eslint.io/rules/no-array-constructor
			"@typescript-eslint/no-array-constructor": 1,
			// Disallow duplicate enum member values
			// https://typescript-eslint.io/rules/no-duplicate-enum-values
			"@typescript-eslint/no-duplicate-enum-values": 1,
			// Allow use of the `any` type
			"@typescript-eslint/no-explicit-any": 0,
			// Disallow extra non-null assertions
			// https://typescript-eslint.io/rules/no-extra-non-null-assertion
			"@typescript-eslint/no-extra-non-null-assertion": 1,
			// Enforce valid definition of `new` and `constructor`
			// https://typescript-eslint.io/rules/no-misused-new
			"@typescript-eslint/no-misused-new": 1,
			// Disallow TypeScript namespaces
			// https://typescript-eslint.io/rules/no-namespace
			"@typescript-eslint/no-namespace": 1,
			// Disallow non-null assertions after an optional chain expression
			// https://typescript-eslint.io/rules/no-non-null-asserted-optional-chain
			"@typescript-eslint/no-non-null-asserted-optional-chain": 1,
			// Disallow aliasing `this`
			// https://typescript-eslint.io/rules/no-this-alias
			"@typescript-eslint/no-this-alias": 1,
			// Disallow unnecessary constraints on generic types
			// https://typescript-eslint.io/rules/no-unnecessary-type-constraint
			"@typescript-eslint/no-unnecessary-type-constraint": 1,
			// Disallow unsafe declaration merging
			// https://typescript-eslint.io/rules/no-unsafe-declaration-merging
			"@typescript-eslint/no-unsafe-declaration-merging": 1,
			// Disallow `require` statements except in import statements
			// https://typescript-eslint.io/rules/no-var-requires
			"@typescript-eslint/no-var-requires": 1,
			// Enforce the use of `as const` over literal type
			// https://typescript-eslint.io/rules/prefer-as-const
			"@typescript-eslint/prefer-as-const": 1,
			// Disallow certain triple slash directives in favor of ES6-style import declarations
			// https://typescript-eslint.io/rules/triple-slash-reference
			"@typescript-eslint/triple-slash-reference": 1,

			/**
			 * Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/stylistic.ts
			 */
			// Require that function overload signatures be consecutive
			// https://typescript-eslint.io/rules/adjacent-overload-signatures
			"@typescript-eslint/adjacent-overload-signatures": 1,
			// Require consistently using `T[]` for arrays instead of `Array<T>`
			// https://typescript-eslint.io/rules/array-type
			"@typescript-eslint/array-type": 1,
			// Disallow `// tslint:<rule-flag>` comments
			// https://typescript-eslint.io/rules/ban-tslint-comment
			"@typescript-eslint/ban-tslint-comment": 1,
			// Enforce that literals on classes are exposed in a consistent style
			// https://typescript-eslint.io/rules/class-literal-property-style
			"@typescript-eslint/class-literal-property-style": 1,
			// Enforce specifying generic type arguments on type annotation or constructor name of a constructor call
			// https://typescript-eslint.io/rules/consistent-generic-constructors
			"@typescript-eslint/consistent-generic-constructors": 1,
			// Require the `Record` type instead of index signatures
			// https://typescript-eslint.io/rules/consistent-indexed-object-style
			"@typescript-eslint/consistent-indexed-object-style": 1,
			// Enforce consistent usage of type assertions
			// https://typescript-eslint.io/rules/consistent-type-assertions
			"@typescript-eslint/consistent-type-assertions": 1,
			// Enforce type definitions to consistently use `interface` instead of `type`
			// https://typescript-eslint.io/rules/consistent-type-definitions
			"@typescript-eslint/consistent-type-definitions": 1,
			// Disallow non-null assertion in locations that may be confusing
			// https://typescript-eslint.io/rules/no-confusing-non-null-assertion
			"@typescript-eslint/no-confusing-non-null-assertion": 1,
			// Disallow the declaration of empty interfaces
			// https://typescript-eslint.io/rules/no-empty-interface
			"@typescript-eslint/no-empty-interface": 1,
			// Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean
			// https://typescript-eslint.io/rules/no-inferrable-types
			"@typescript-eslint/no-inferrable-types": 1,
			// Enforce the use of `for-of` loop over the standard `for` loop where possible
			// https://typescript-eslint.io/rules/prefer-for-of
			"@typescript-eslint/prefer-for-of": 1,
			// Enforce using function types instead of interfaces with call signatures
			// https://typescript-eslint.io/rules/prefer-function-type
			"@typescript-eslint/prefer-function-type": 1,
			// Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules
			// https://typescript-eslint.io/rules/prefer-namespace-keyword
			"@typescript-eslint/prefer-namespace-keyword": 1,
			// Allow unused vars since we have many of them
			"@typescript-eslint/no-unused-vars": 0,
			// Disable checks for unifiable signatures
			"@typescript-eslint/unified-signatures": 0,
		},
	},
	{
		// Based off of: https://github.com/typescript-eslint/typescript-eslint/blob/v6.13.1/packages/eslint-plugin/src/configs/eslint-recommended.ts
		files: ["**/*.ts"],
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
		"files": ["**/*.cjs"],
		languageOptions: {
			globals: {
				...globals.node,
			},
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
			"@typescript-eslint/no-unused-expressions": 0,
			"@typescript-eslint/no-extraneous-class": 0,
		},
	},
];
