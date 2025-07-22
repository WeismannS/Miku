import { FiberNode, Maybe, Props, TextVNode, VNode} from "../types/types.ts";
import { isEventListener, isTextNode, setAttributes } from "../utils/utils.ts";

let nextUnitOfWork : Maybe<FiberNode> = null
let wipRoot : Maybe<FiberNode> = null; 
let currentRoot: Maybe<FiberNode> = null;
let deletions : FiberNode[] = [];
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
function performUnitOfWork(fiber: FiberNode | null): Maybe<FiberNode> {
    if (!fiber)
        return null;
    if (!fiber.dom)
        if (fiber.type !== "frag")
            fiber.dom = createDom(fiber);
        else 
            fiber.dom = fiber.parent?.dom || null;
    const elements = fiber.props.children;
    if (elements && elements.length > 0)
        recouncilChildren(elements, fiber);
    if (fiber.child) {
            return fiber.child;
    }  
    return findNextSibling(fiber);
}

function findNextSibling(fiber: FiberNode): Maybe<FiberNode> {
    let currentFiber: Maybe<FiberNode> = fiber;
    
    while (currentFiber) {
        if (currentFiber.sibling) {
            return currentFiber.sibling;
        }
        currentFiber = currentFiber.parent;
    }
    return null;
}
export function createDom(fiber : FiberNode) {
    const dom = isTextNode(fiber)
        ? document.createTextNode(fiber.props.nodeValue)
        : document.createElement(fiber.type)
    
    if (dom.nodeType == Node.ELEMENT_NODE)
        setAttributes(dom as Element, fiber.props)
    return dom
}
    
function recouncilChildren(elements: VNode[], wipFiber: FiberNode) {
    let index = 0;
    let prevSibling: Maybe<FiberNode> = null;
    let oldFiber = wipFiber.alternate?.child
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        const sameType: boolean = !!(oldFiber && element && oldFiber.type === element.type);
        let newFiber: FiberNode | null = null; 
        if (sameType )
        {
            newFiber = {
                type: oldFiber?.type || "",
                props: element.props,
                dom: oldFiber?.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        if (!sameType && element) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        if (!sameType && oldFiber) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        if (index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling!.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
}

export function render(elm: VNode | TextVNode, container: Element) {
    wipRoot = {
        dom: container,
        type: "",
        props: {
            children: [elm]
        },
        alternate : currentRoot
    }
    nextUnitOfWork = wipRoot;
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot?.child)
    currentRoot = wipRoot;
    wipRoot = null
}

function commitWork(fiber : Maybe<FiberNode>) {
    if (!fiber)
        return
    const domParent = fiber.parent?.dom
    if (domParent && fiber.effectTag === "PLACEMENT" && fiber.type !== "frag")
    {
        console.log("Placing", fiber.type, fiber.dom);
        domParent.appendChild(fiber.dom as Element | Text);
    }
    else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        console.log("Updating", fiber.type, fiber.dom);
        updateDom(fiber.dom as Element | Text, fiber.alternate?.props || {}, fiber.props);
    } else if (fiber.effectTag === "DELETION" && fiber.dom) {
        const dom = fiber.dom as Element | Text;
        dom.remove();
    }
    
    if (fiber.child)
        commitWork(fiber.child)
    
    if (fiber.sibling) {
        console.log("sibling here")
        commitWork(fiber.sibling)
    }
}

function updateDom(dom: Element | Text, oldProps: Props, newProps: Props) {
    for (const key in oldProps) {
        if (!(key in newProps)) {
            if (key == "children") continue;
            if (isEventListener(key)) {
                const eventName = key.slice(2).toLowerCase();
                dom.removeEventListener(eventName, oldProps[key] as EventListener);
            } 
            else 
                (dom as Element).removeAttribute(key);
        }
    }
    for (const key in newProps) {
        if (key == "children") continue;
        if (newProps[key] !== oldProps[key]) {
            setAttributes(dom as Element, { [key]: newProps[key] });
        }
    }
}
