import { FiberNode, Maybe } from "../types/types.ts"

 const globalState = {
    nextUnitOfWork: null as Maybe<FiberNode>,
    wipRoot: null as Maybe<FiberNode>,
    currentRoot: null as Maybe<FiberNode>,
    deletions: [] as FiberNode[],
    currentFiber: null as Maybe<FiberNode>,
    hookQueues: new Map<string, Array<(state: any) => any>>(),
    pendingEffects : [] as any[]
};
// @ts-ignore
globalThis.globalState = globalState;
export {globalState}
