import { FiberNode, Maybe, TextVNode, VNode} from "../types/types.ts";
import { isTextNode, setAttributes } from "../utils/utils.ts";

let nextUnitOfWork : Maybe<FiberNode> = null
let wipRoot : Maybe<FiberNode> = null; 

export const workLoop: IdleRequestCallback = function (deadline) {
    let shouldYield = false;
    while (!shouldYield && nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot)
        commitRoot();
    requestIdleCallback(workLoop);
}

function createDom(fiber : FiberNode) {
    const dom = isTextNode(fiber)
        ? document.createTextNode(fiber.props.nodeValue)
        : document.createElement(fiber.type)
    
    if (dom.nodeType == Node.ELEMENT_NODE)
        setAttributes(dom as Element, fiber.props)
    
    return dom
}

function performUnitOfWork(fiber: FiberNode | null): Maybe<FiberNode> {
    if (!fiber)
        return null;
    
    if (!fiber.dom)
        fiber.dom = createDom(fiber);
    
    const elements = fiber.props.children
    if (!elements)
        return null;
    
    let index = 0
    let prevSibling : Maybe<FiberNode> = null
    
    while (index < elements.length) {
        const element = elements[index]
        console.log(element.type)
        
        const newFiber : FiberNode = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling!.sibling = newFiber 
        }
        prevSibling = newFiber
        index++
    }
    
    if (fiber.child) {
        return fiber.child
    }
    
    let nextFiber : Maybe<FiberNode> = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
    
    return null; // Fix: Explicit return null
}

export function render(elm: VNode | TextVNode, container: Element) {
    wipRoot = {
        dom: container,
        type: "",
        props: {
            children: [elm]
        }
    }
    nextUnitOfWork = wipRoot;
}

function commitRoot() {
    commitWork(wipRoot?.child)
    wipRoot = null
}

function commitWork(fiber : Maybe<FiberNode>) {
    if (!fiber)
        return
    const domParent = fiber.parent?.dom
    console.log("im in")
    console.log(fiber.type + "<----" + Boolean(fiber.dom))
    if (domParent && fiber.dom) {
        if (domParent.nodeType === Node.ELEMENT_NODE) {
            console.log("pushed");
            (domParent as Element).appendChild(fiber.dom)
        }
    }
    
    if (fiber.child)
        commitWork(fiber.child)
    
    if (fiber.sibling) {
        console.log("sibling here")
        commitWork(fiber.sibling)
    }
}