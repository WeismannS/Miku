import { globalState } from "../globals/globals.ts";
import { Props } from "../types/types";



export function useState<T>(
  initial: T | (() => T)
): [T, (arg: T | ((oldState: T) => T)) => void] {
  if (!globalState.currentFiber)
    throw new Error("Not in a function Component!");

  const currentFiber = globalState.currentFiber;
  const oldHook = currentFiber.alternate?.hooks?.[currentFiber.hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : typeof initial === "function" ? (initial as () => T)() : initial,
    queue: [] as Array<(state: T) => T>,
  };

  const actions = oldHook ? oldHook.queue : [];

  actions.forEach((action :  ((old: T) => T) ) => {
    hook.state = action(hook.state);
  });
  
  const setState = (action: T | ((oldState: T) => T)) => {
    const update = typeof action === "function" ? (action as (old: T) => T) : () => action;
    hook.queue.push(update);

    globalState.wipRoot = {
      type : globalState.currentRoot?.type || "" ,
      dom: globalState?.currentRoot?.dom,
      props: globalState?.currentRoot?.props as Props,
      alternate: globalState.currentRoot,
      hookIndex : 0,
    };
    globalState.nextUnitOfWork = globalState.wipRoot;
    globalState.deletions = [];
  };

  currentFiber.hooks?.push(hook);
  currentFiber.hookIndex++;

  return [hook.state, setState];
}
