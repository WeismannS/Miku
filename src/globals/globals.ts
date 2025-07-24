import { FiberNode, Maybe } from "../types/types.ts"

export const globalState = {
    nextUnitOfWork: null as Maybe<FiberNode>,
    wipRoot: null as Maybe<FiberNode>,
    currentRoot: null as Maybe<FiberNode>,
    deletions: [] as FiberNode[],
    currentFiber: null as Maybe<FiberNode>,
};