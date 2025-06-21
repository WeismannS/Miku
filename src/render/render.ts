import { FiberNode} from "../types/types";
import { isTextNode, setAttributes } from "../utils/utils";



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

function createDom(fiber : FiberNode) {
  const dom =
    isTextNode(fiber)
      ? document.createTextNode("")
      : document.createElement(fiber.type)
  if (dom.nodeType == Node.ELEMENT_NODE)
    setAttributes(dom as Element, fiber.props)
  return dom
}

function performUnitOfWork(fiber: FiberNode | null) : FiberNode | null
{
    return null;
}