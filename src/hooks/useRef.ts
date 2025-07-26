import { globalState } from "../globals/globals.ts";



export function useRef<T>(initialValue: T): { current: T } {
    if (!globalState.currentFiber) {
        throw new Error("Not in a function Component!");
    }
    const currentFiber = globalState.currentFiber;
    const oldHook = currentFiber.alternate?.hooks?.[currentFiber.hookIndex];
    
    const hook = {
        tag: "REF",
        value: oldHook ? oldHook.value : initialValue,
    };
    
    currentFiber.hooks?.push(hook);
    currentFiber.hookIndex++;
    
    return { current: hook.value };
}