/**
 * This is for plugin authors.
 * If you're not interested in writing plugins for Color.js, you can skip this.
 *
 * Hooks afford extensibility far beyond what can be achieved
 * by overriding properties and methods, or using functions.
 * Hooks allow plugin authors to change how Color.js’ internal code works,
 * by adding custom callbacks to predefined points in the execution.
 *
 * You can find available hooks by searching the source code for `hooks.run(` in color.js.
 * If you need a hook that is not present, we typically accept pull requests for new hooks pretty easily!
 *
 * The Hooks module exports both a hooks object that is used throughout Color.js (as a default export),
 * as well as a Hooks class (as a named export) that can be used to create new sets of hooks.
 */
export class Hooks {
	// Can't find a way to type this more specifically
	// without conflicting with the types of add and run
	[name: string]: any;

	/**
	 * Schedule a callback to be executed at a certain point in the source code
	 * @param name The name of the hook to add the callback to
	 * @param callback The code to run at the given hook.
	 * The callback will be callewd with (typically) the same context as the calling code,
	 * and a single object as its only argument (typically called `env`)
	 * with writeable properties for various aspects of the calling environment
	 * @param [first=false] Whether to prepend instead of append this callback to any existing callbacks
	 * on the same hook. Defaults to `false`
	 */
	add (
		name: string | string[],
		callback: (env: Record<string, any>) => void,
		first?: boolean,
	): void;
	/**
	 * Creates a hook for plugin authors to add code to
	 * @param name The name of the hook to create.
	 * By convention, it's in the form `[class-name]-[function name]-[location in function body]`.
	 * Class name can be omitted if it's in `color.js`.
	 * Location in function body is typically something like `"start"`, `"end'`,
	 * `"before-conversion"`, `"after-init"`, etc.
	 * @param env Object with properties to be passed to the hook's callback.
	 * This will also be used as the function context, unless it has a `context` property,
	 * in which case that is used as the function context
	 */
	run (name: string, env?: { context?: Record<string, any> } & Record<string, any>): void;
}

declare const hooks: Hooks;

export default hooks;
