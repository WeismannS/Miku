import { Fragment } from "../Factory/Factory.ts";
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
    {
        commitRoot();
        globalState.pendingEffects = globalState.pendingEffects.map(e=> e()).filter( e=> e!=undefined)

    }
    requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: FiberNode | null): Maybe<FiberNode> {
    if (!fiber)
        return null;
    const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    // console.log("Performing unit of work for function component", fiber.type, fiber.props);
    updateFunctionComponent(fiber)
  } else {
    console.log(fiber)
    // console.log("Performing unit of work for fiber", fiber.type, fiber.props);
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
    console.log("Creating DOM for fiber", fiber.type, fiber.props);
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
        
        if (sameType) {
            // For text nodes, always update props.nodeValue to the latest value
            console.log("sameType", oldFiber?.type, element.props)
            const newProps = oldFiber?.type === "TEXT_NODE"
                ? { nodeValue: element.props.nodeValue }
                : element.props;
            console.log("newProps", newProps)
            newFiber = {
                type: oldFiber?.type || "",
                props: newProps,
                dom: oldFiber?.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
                hookIndex: 0, 
                hooks: [], 
            }
        }
        if (!sameType && element) {
            // console.warn("Old fiber not found", oldFiber)
            // console.log(element)
            newFiber = {
                type: element.type || "TEXT_NODE",
                props: element.props || {nodeValue: element},
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
                hookIndex : 0,
            }
        }
        if (!sameType && oldFiber) {
            // console.error("DELETION HERE ", oldFiber)
            oldFiber.effectTag = "DELETION";
            if (oldFiber.child?.type == Fragment)
                oldFiber.child.effectTag = "DELETION";
            globalState.deletions.push(oldFiber);
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        if (index === 0) {
            wipFiber.child = newFiber;
        } else if (element){
        if (prevSibling) {
            prevSibling.sibling = newFiber;
        }
        }
        prevSibling = newFiber;
        index++;
    }
}

export function render(elm: VNode | TextVNode, container: Element) {
    globalState.wipRoot = {
        dom: container,
        type: "ROOT",
        props: {
            children: [elm]
        },
        alternate : globalState.currentRoot,
        hookIndex : 0,
    }
    
    globalState.nextUnitOfWork = globalState.wipRoot;
}

function commitRoot() {
    console.warn("commitRoot", globalState.wipRoot)
    globalState.deletions.forEach(commitWork);
    commitWork(globalState.wipRoot?.child);
    
    // ✅ Clean up any remaining empty queues after commit
    for (const [key, queue] of  globalState.hookQueues.entries()) {
        if (queue.length === 0) {
            globalState.hookQueues.delete(key);
        }
    }
    
    globalState.currentRoot = globalState.wipRoot;
    globalState.wipRoot = null;
}
function findAppFiber(root: Maybe<FiberNode>): Maybe<FiberNode> {
    // Navigate to find the App component fiber
    return root?.child; // Adjust this based on your fiber tree structure
}

function commitWork(fiber : Maybe<FiberNode>) {
    if (!fiber)
        return
    // console.log("Committing work for fiber", fiber.type, fiber.dom);
    fiber.hookIndex = 0;
    let domParentFiber = fiber.parent
  while ( domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
    const domParent = domParentFiber?.dom
    if (domParent && fiber.parent?.effectTag != 'DELETION'  && fiber.effectTag === "PLACEMENT" &&  fiber.dom != null && fiber.type !== "frag")
    {
        // console.log("Placing", fiber.type, fiber.dom);
        domParent.appendChild(fiber.dom as Element | Text);
    }
    else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        // console.log("Updating", fiber.type, fiber.dom);
        updateDom(fiber.dom as Element | Text, fiber.alternate?.props || {}, fiber.props);
   } else if (fiber.effectTag === "DELETION") {
    // console.error("Deleting", fiber)
    commitDeletion(fiber, domParent as Element | Text);
}
    if (fiber.child && fiber.effectTag !== "DELETION") 
    {
        // console.log("Child here", fiber.child)

        commitWork(fiber.child)
    }
    if (fiber.sibling) {
        // console.log("sibling here", fiber.sibling)
        commitWork(fiber.sibling)
    }
}


function commitDeletion(fiber: Maybe<FiberNode>, domParent: Element | Text) {
    if (!fiber) return;
    // console.log("Called !");
    if (fiber.dom) {
        // console.warn("deleted!", fiber, domParent);
            domParent.removeChild(fiber.dom);
    } else {

        commitDeletion(fiber.child, domParent);
    }
    if (fiber.parent?.type === "frag" && fiber.sibling) {
        commitDeletion(fiber.sibling, domParent);
    }
}

function updateDom(dom: Element | Text, oldProps: Props, newProps: Props) {
    console.log("Updating DOM", oldProps, newProps)
    // Only handle non-event attributes here
    for (const key in oldProps) {
        if (!(key in newProps)) {
            if (key == "children") continue;
            if (!isEventListener(key)) {
                (dom as Element).removeAttribute(key);
            }
        }
    }
    
    if (dom.nodeType === Node.ELEMENT_NODE) {
        setAttributes(dom as Element, newProps, oldProps);
    }
    if (dom.nodeType === Node.TEXT_NODE) {
        console.warn("Updating text node:", {
            oldText: oldProps.nodeValue,
            newText: newProps.nodeValue,
            domBefore: (dom as Text).nodeValue
        });
        (dom as Text).nodeValue = newProps.nodeValue as string;
        console.warn("Text node after update:", (dom as Text).nodeValue);
    }
}

function updateFunctionComponent(fiber : FiberNode) {
    if (!fiber.type || typeof fiber.type !== "function") {
        throw new Error("Fiber type is not a function component");
    }
    console.log(`updateFunctionComponent called for:`, fiber.type.name);

  fiber.hooks ??= [];
  globalState.currentFiber = fiber;
  
  const children = [fiber.type(fiber.props)]
  console.error(fiber.props)
//   console.log("Function component", fiber.type, children)
  recouncilChildren(children, fiber)
}

function updateHostComponent(fiber : FiberNode) {
  if (!fiber.dom) {
    fiber.dom = fiber.type !== "frag" ? createDom(fiber) : fiber.parent?.dom
  }
  recouncilChildren(fiber.props.children || [], fiber);
}