import { globalState } from "../globals/globals";



export function useRef<T>(initialValue?: T): { current: T } {
    if (!globalState.currentFiber)
        throw new Error("Not in a function Component!");
    const currentFiber = globalState.currentFiber;
    const oldHook = currentFiber.alternate?.hooks?.[currentFiber.hookIndex];
    let hook;
    if (oldHook && oldHook.value) {
        hook = oldHook;
    } else {
        hook = {
            tag: "REF",
            value: { current: initialValue },
        };
    }
    currentFiber.hooks[currentFiber.hookIndex] = hook;
    currentFiber.hookIndex++;
    
    return hook.value;
}