import { createElement } from "../Factory/Factory";
import { FiberNode, TextVNode, VNode} from "../types/types";
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

function performUnitOfWork(fiber: FiberNode | null): FiberNode | null {
    if (!fiber)
        return null;
    if (!fiber?.dom)
        fiber.dom = createDom(fiber);
    if (fiber.parent)
        fiber.parent.dom?.appendChild(fiber.dom)
    const elements = fiber.props.children
    if (!elements)
        return null;
    let index = 0
    let prevSibling : FiberNode | null = null
    while (index < elements.length) {
        const element = elements[index]
        const newFiber : FiberNode = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        prevSibling = newFiber
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }
        index++
    }
}

function render(elm: VNode | TextVNode, container: Text | Element) {
  nextUnitOfWork = {
    dom: container,
    type: "",
    props :
    {
      children : [elm]
    }
  }
}


