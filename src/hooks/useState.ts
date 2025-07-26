import { globalState } from "../globals/globals.ts";


function getHookQueueKey(fiber: any, hookIndex: number): string {
  return `${fiber.type?.name || 'component'}-${hookIndex}`;
}

export function useState<T>(
  initial: T | (() => T)
): [T, (arg: T | ((oldState: T) => T)) => void] {
  if (!globalState.currentFiber)
    throw new Error("Not in a function Component!");
 
  const currentFiber = globalState.currentFiber;
  const hookIndex = currentFiber.hookIndex;
  const oldHook = currentFiber.alternate?.hooks?.[hookIndex];
 
  console.log(`useState[${hookIndex}]: oldHook exists:`, !!oldHook, 'oldHook state:', oldHook?.state);
 
  const queueKey = getHookQueueKey(currentFiber, hookIndex);
  const pendingActions = globalState.hookQueues.get(queueKey) || [];
 
  console.log(`useState[${hookIndex}]: pending actions from queue:`, pendingActions.length);
 
  let newState = oldHook ? oldHook.state : (typeof initial === "function" ? (initial as () => T)() : initial);
 
  pendingActions.forEach((action: (old: T) => T) => {
    const oldState = newState;
    newState = action(newState);
    console.log(`useState[${hookIndex}]: applying action, old state:`, oldState, 'new state:', newState);
  });
 
  if (pendingActions.length > 0) {
    globalState.hookQueues.set(queueKey, []); 
    console.log(`useState[${hookIndex}]: cleared queue for key:`, queueKey);
  }
 
  const hook = {
    state: newState,
    queue: [] as Array<(state: T) => T>,
  };
 
  const setState = (action: T | ((oldState: T) => T)) => {
    const update = typeof action === "function" ? (action as (old: T) => T) : () => action;
   
    const currentQueue = globalState.hookQueues.get(queueKey) || [];
    currentQueue.push(update);
    globalState.hookQueues.set(queueKey, currentQueue);
   
    console.log(`useState[${hookIndex}]: setState called, added to queue. Queue length:`, currentQueue.length);
    console.log(`useState[${hookIndex}]: currentRoot exists:`, !!globalState.currentRoot, 'nextUnitOfWork exists:', !!globalState.nextUnitOfWork);
    console.log(`useState[${hookIndex}]: alternate fiber hooks:`,
      currentFiber.alternate?.hooks?.map(h => h.state));
    console.log(`useState[${hookIndex}]: current fiber hooks:`,
      currentFiber.hooks?.map(h => h.state));
    
    if (!globalState.nextUnitOfWork && globalState.currentRoot) {
      console.log(`useState[${hookIndex}]: scheduling re-render`);
      globalState.wipRoot = {
        type: globalState.currentRoot.type,
        dom: globalState.currentRoot.dom,
        props: globalState.currentRoot.props,
        alternate: globalState.currentRoot,
        hookIndex: 0,
      };
      globalState.nextUnitOfWork = globalState.wipRoot;
      globalState.deletions = [];
    } else {
      console.log(`useState[${hookIndex}]: not scheduling re-render - already in progress or no currentRoot`);
    }
  };
  if (oldHook?.state)
    oldHook.state = newState;
  else
    currentFiber.hooks = currentFiber.hooks || [];
  currentFiber.hooks?.push(hook);
  currentFiber.hookIndex++;
  console.log(`useState[${hookIndex}]: returning state:`, hook.state);
  return [hook.state, setState];
}