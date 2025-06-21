import { FiberNode } from "../types/types";



let nextUnitOfWork : FiberNode | null = null

const workLoop: IdleRequestCallback = function (deadline) {
    let shouldYield = false;
    while (!shouldYield && nextUnitOfWork)
    {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}



function performUnitOfWork(fiber: FiberNode | null) : FiberNode | null
{
    return null;
}