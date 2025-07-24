import { globalState } from "../globals/globals.ts";
import { FiberNode, Maybe, Props, TextVNode, VNode} from "../types/types.ts";
import { isEventListener, isTextNode, setAttributes } from "../utils/utils.ts";


export const workLoop: IdleRequestCallback = function (deadline) {
    let shouldYield = false;
    while (!shouldYield && globalState.nextUnitOfWork) {
        globalState.nextUnitOfWork = performUnitOfWork(globalState.nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!globalState.nextUnitOfWork && globalState.wipRoot)
        commitRoot();
    requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: FiberNode | null): Maybe<FiberNode> {
    if (!fiber)
        return null;
    const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
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
        : document.createElement(fiber.type as string);
    
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
                hookIndex : 0
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
                hookIndex : 0
            }
        }
        if (!sameType && oldFiber) {
            oldFiber.effectTag = "DELETION";
            globalState.deletions.push(oldFiber);
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
    globalState.wipRoot = {
        dom: container,
        type: "",
        props: {
            children: [elm]
        },
        alternate : globalState.currentRoot,
        hookIndex : 0
    }
    globalState.nextUnitOfWork = globalState.wipRoot;
}

function commitRoot() {
    globalState.deletions.forEach(commitWork);
    commitWork(globalState.wipRoot?.child)
    globalState.currentRoot = globalState.wipRoot;
    globalState.wipRoot = null
}

function commitWork(fiber : Maybe<FiberNode>) {
    if (!fiber)
        return
    fiber.hookIndex = 0;
      let domParentFiber = fiber.parent
  while ( domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
    const domParent = domParentFiber?.dom
    if (domParent && fiber.effectTag === "PLACEMENT" &&  fiber.dom != null && fiber.type !== "frag")
    {
        console.log("Placing", fiber.type, fiber.dom);
        domParent.appendChild(fiber.dom as Element | Text);
    }
    else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        console.log("Updating", fiber.type, fiber.dom);
        updateDom(fiber.dom as Element | Text, fiber.alternate?.props || {}, fiber.props);
    } else if (fiber.effectTag === "DELETION" && fiber.dom) {
        console.log("Deleting", fiber.type, fiber.dom)
        commitDeletion(fiber, domParent as Element | Text);
    }
    
    if (fiber.child)
        commitWork(fiber.child)
    
    if (fiber.sibling) {
        console.log("sibling here")
        commitWork(fiber.sibling)
    }
}


function commitDeletion(fiber : Maybe<FiberNode>, domParent : Element | Text) {
  if (!fiber) return;
  if (fiber?.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber?.child, domParent)
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


function updateFunctionComponent(fiber : FiberNode) {
    if (!fiber.type || typeof fiber.type !== "function") {
        throw new Error("Fiber type is not a function component");
    }
  fiber.hooks = [];
  globalState.currentFiber = fiber;
  
  const children = [fiber.type(fiber.props)]
  console.log("Function component", fiber.type, children)
  recouncilChildren(children, fiber)
}

function updateHostComponent(fiber : FiberNode) {
  if (!fiber.dom) {
    fiber.dom = fiber.type !== "frag" ? createDom(fiber) : fiber.parent?.dom
  }
  recouncilChildren(fiber.props.children || [], fiber);
}