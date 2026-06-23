# Contribution guidelines

## Getting up and running with build tools

We use 11ty for processing CSS and HTML for the website, and Rollup.js for bundling Color.js.

1. [Install npm](https://www.npmjs.com/get-npm) if you don't already have it
2. `cd` to the project directory and run `npm install` to install local modules
3. Done! Now run `npm run build` to build.

Run `npm run watch` before you start working on the website to build
automatically as you edit files. This also serves the website at http://localhost:8080/.

Or, for individual tasks:

- `npm run watch:html` to build HTML and run a development server.
- `npm run watch:css` to process PostCSS files (`*.src.css` in our repo)
- `npm run watch:js` to create Color.js bundles in `dist/`

All of the above also have `build` versions (e.g. `npm run build:js` or `npm run build` for everything) for one-time builds with no watching.

## Commit messages

- If working on a color space, please prefix your commit with `[spaces/SPACE_ID]`
- If working on a module other than color.js, please prefix your commit with `[modulename]` e.g. `[interpolation]`

## AI-assisted contributions

We welcome contributions that use AI assistants provided you treat them as **drafting tools, not authors**: review and test what they produce as if you wrote it yourself, and be transparent about it.

If AI was involved in producing a contribution:

- **Verify and test the code yourself.** You're responsible for what you submit. Pay particular attention to areas that cannot be validated via unit testing, such as architectural coherence.
- **Don't let AI assistants post on your behalf without explicit approval.** This applies to PR comments, issue replies, and any direct interaction with maintainers or other contributors. Read each message before it goes out — even if you asked the assistant to draft it.
- **Mark commits with `Co-Authored-By:`.** Claude Code does this automatically; for other tools, add the trailer manually. Example: `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **Disclose AI use in PRs and issues** whose text was largely generated, e.g. with a note at the end:
  > _Drafted with the help of Claude._

Submitting AI-generated content as if it were your own — without review, testing, or attribution — wastes maintainer time and isn't welcome. See #723 for the discussion behind this policy.

## Code style

Please install an ESLint plugin for your editor. There is an `.eslintrc.json` file in the repo which encodes most of the coding style of the project.

To lint and format the project, run `npm run lint`.

Here are a few other guidelines that cannot be enforced via ESLint:

- Prefer single-word names over multi-word names. 3+ word names are especially frowned upon.
- camelCase over underscore_case, with few exceptions.
- Don't be afraid of unicode characters when appropriate, except on user-facing names. E.g. use ε over epsilon internally, but not ΔΕ over deltaE in the public-facing method name.
