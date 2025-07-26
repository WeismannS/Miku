import { globalState } from "../globals/globals.ts";

export function useEffect(fn: (() => void) | (() => (() => void)), dependencies?: any[]): void {
    console.log('useEffect called with dependencies:', dependencies);
    if (!globalState.currentFiber)
        throw new Error("Not in a function Component!");
    
    const currentFiber = globalState.currentFiber;
    const oldHook = currentFiber.alternate?.hooks?.[currentFiber.hookIndex];
    
    // ✅ OLD dependencies come from the previous render's hook
    const oldDependencies = oldHook ? oldHook.dependencies : undefined;
    
    // ✅ NEW dependencies come from the current function call (current render)
    const newDependencies = dependencies;
    console.log("this is oldhook", oldHook)
    const shouldApply =
        oldHook === undefined ||
        newDependencies === undefined ||
        oldDependencies === undefined ||
        newDependencies.length !== oldDependencies.length ||
        newDependencies.some((dep, i) => !Object.is(dep, oldDependencies[i]));
    console.log(fn.toString(), " ", shouldApply)
    console.log(
        `useEffect: oldHook exists:`, !!oldHook,
        'old deps:', oldDependencies,
        'new deps:', newDependencies,  // ✅ This should show [2]
        'should apply:', shouldApply
    );
    
    if (shouldApply) {
        globalState.pendingEffects.push(fn);
    }
    
    // ✅ Store the CURRENT dependencies for the next render
    const hook = {
        tag: "EFFECT",
        setUp: fn,
        dependencies: newDependencies || [], // ✅ Store current deps
    };
    
    currentFiber.hooks?.push(hook);
    currentFiber.hookIndex++;
}