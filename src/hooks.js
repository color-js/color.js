/**
 * A class for adding deep extensibility to any piece of JS code
 */
export class Hooks {
	add (name, callback, first) {
		if (typeof arguments[0] != "string") {
			// Multiple hooks
			for (var hookName in arguments[0]) {
				this.add(hookName, arguments[0][hookName], arguments[1]);
			}

			return;
		}

		(Array.isArray(name) ? name : [name]).forEach(function (name) {
			this[name] = this[name] || [];

			if (callback) {
				this[name][first ? "unshift" : "push"](callback);
			}
		}, this);
	}

	run (name, env) {
		this[name] = this[name] || [];
		this[name].forEach(function (callback) {
			callback.call(env && env.context ? env.context : env, env);
		});
	}
}

/**
 * The instance of {@link Hooks} used throughout Color.js
 */
const hooks = new Hooks();

export default hooks;
