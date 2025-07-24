import { globalState } from "../globals/globals.ts";


export function useEffect( fn : (() => void) | (  () => (()=>void)), dependencies? : any[] )  : void
{
    if (!globalState.currentFiber)
        throw new Error("Not in a function Component!");
    const currentFiber = globalState.currentFiber;
    const oldHook = currentFiber.alternate?.hooks?.[currentFiber.hookIndex];
    const hook = {
        tag : "EFFECT",
        setUp :  oldHook ? oldHook.setUp : fn,
        dependencies : oldHook ? oldHook.dependencies as any[] : []
    }
    const applyEffect = oldHook == undefined  || dependencies == undefined || (hook.dependencies.some((e, i)  => !Object.is(e, dependencies[i]))) || dependencies.length != hook.dependencies.length
    if (applyEffect)
        globalState.currentFiber.pendingEffects.push(fn);
    hook.dependencies = dependencies || [];
    currentFiber.hooks?.push(hook)
    currentFiber.hookIndex++;
}