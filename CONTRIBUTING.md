# Contribution guidelines

## Commit messages

- If working on a color spaces, please prefix your commit with `[spaces/SPACE_ID]`
- If working on a demo app, please prefix your commit with `[apps/APP_ID]`
- If working on a module other than color.js, please prefix your commit with `[modulename]` e.g. `[interpolation]`

## Code style

Please install an ESLint plugin for your editor. There is an `.eslintrc.json` file in the repo which encodes most of the coding style of the project.

Here are a few other guideliines that cannot be enforced via ESLint:

- When you define a function, use a space between the opening paren and its name. That way we can search for "functionName (" and find its definition immediately, instead of having to wade through calls to the function.
- Prefer single-word names over multi-word names. 3+ word names are especially frowned upon.
- camelCase over underscore_case, with few exceptions.
- Don't be afraid of unicode characters when appropriate, except on user-facing names. E.g. use ε over epsilon internally, but not ΔΕ over deltaE in the public-facing method name.
