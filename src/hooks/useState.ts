import { globalState } from "../globals/globals";

export function useState<T>(
	initial: T | (() => T),
): [T, (arg: T | ((oldState: T) => T)) => void] {
	if (!globalState.currentFiber)
		throw new Error("Not in a function Component!");

	const currentFiber = globalState.currentFiber;
	const hookIndex = currentFiber.hookIndex;
	const oldHook = currentFiber.alternate?.hooks?.[hookIndex];

	let newState = oldHook
		? oldHook.state
		: typeof initial === "function"
			? (initial as () => T)()
			: initial;

	if (oldHook?.queue) {
		oldHook.queue.forEach((action: (old: T) => T) => {
			newState = action(newState);
		});
		oldHook.queue = [];
	}

	const hook = oldHook || {
		tag: "STATE",
		state: newState,
		queue: [] as Array<(state: T) => T>,
	};

	hook.state = newState;

	const setState = (action: T | ((oldState: T) => T)) => {
		const update =
			typeof action === "function" ? (action as (old: T) => T) : () => action;
		if (hook && hook.queue) hook.queue.push(update);

		if (!globalState.nextUnitOfWork && globalState.currentRoot) {
			globalState.wipRoot = {
				type: globalState.currentRoot.type,
				dom: globalState.currentRoot.dom,
				props: globalState.currentRoot.props,
				alternate: globalState.currentRoot,
				hooks: [],
				hookIndex: 0,
				cleanUp: [],
			};
			globalState.nextUnitOfWork = globalState.wipRoot;
			globalState.deletions = [];
		}
	};

	currentFiber.hooks[hookIndex] = hook;
	currentFiber.hookIndex++;

	return [hook.state, setState];
}
