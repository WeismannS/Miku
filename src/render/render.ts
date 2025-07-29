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
        for (const {fn, dependencies, fiber, hookIndex} of globalState.pendingEffects) {
            const cleanUp = fn();
            if (typeof cleanUp === "function") {
                const currentHook = fiber.hooks[hookIndex];
                if (currentHook) {
                    currentHook.cleanUp = cleanUp;
                } else {
                    console.warn("No hook found for effect cleanup at index", hookIndex, "in fiber", fiber.type);
                }
            }
            
        }
        globalState.pendingEffects = [];
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
    
    const oldFiberMap = new Map<string | number, FiberNode>();
    const oldFibersByIndex: FiberNode[] = [];
    
    let oldFiber = wipFiber.alternate?.child;
    let oldIndex = 0;
    while (oldFiber) {
        const key = oldFiber.props?.key ?? `__index_${oldIndex}`;
        oldFiberMap.set(key, oldFiber);
        oldFibersByIndex.push(oldFiber);
        oldFiber = oldFiber.sibling;
        oldIndex++;
    }
    
    const usedOldFibers = new Set<FiberNode>();
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementKey = element?.props?.key ?? `__index_${i}`; 
        let matchingOldFiber = oldFiberMap.get(elementKey); 
        if (!matchingOldFiber && oldFibersByIndex[i] && !usedOldFibers.has(oldFibersByIndex[i])) {
            const oldFiberAtPosition = oldFibersByIndex[i];
            if (oldFiberAtPosition.type === element?.type) {
                matchingOldFiber = oldFiberAtPosition;
            }
        }
        
        const sameType = !!(matchingOldFiber && element && 
            matchingOldFiber.type === element.type);
        
        let newFiber: FiberNode | null = null;
        
        if (sameType && matchingOldFiber) {
    usedOldFibers.add(matchingOldFiber);
    const newProps = matchingOldFiber.type === "TEXT_NODE"
        ? { nodeValue: element.props?.nodeValue }
        : element.props;
        
    newFiber = {
        type: matchingOldFiber.type,
        props: newProps,
        dom: matchingOldFiber.dom,
        parent: wipFiber,
        alternate: matchingOldFiber,
        effectTag: "UPDATE",
        hookIndex: matchingOldFiber.hookIndex, // ✅ Preserve hookIndex
        hooks: [...(matchingOldFiber.hooks || [])], // ✅ Deep copy hooks
    };
} else if (element) {
            newFiber = {
                type: element.type || "TEXT_NODE",
                props: element.props || { nodeValue: element },
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
                hookIndex: 0,
                hooks: [],
            };
        }
                if (i === 0) {
            wipFiber.child = newFiber;
        } else if (prevSibling && newFiber) {
            prevSibling.sibling = newFiber;
        }
        
        if (newFiber) {
            prevSibling = newFiber;
        }
    }
    for (const oldFib of oldFibersByIndex) {
        if (!usedOldFibers.has(oldFib)) {
            oldFib.effectTag = "DELETION";
            globalState.deletions.push(oldFib);
        }
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
        hooks: [],
    }
    
    globalState.nextUnitOfWork = globalState.wipRoot;
}

function commitRoot() {
    const activeElement = document.activeElement;
    const focusInfo = activeElement ? {
        element: activeElement,
        selectionStart: (activeElement as HTMLInputElement).selectionStart,
        selectionEnd: (activeElement as HTMLInputElement).selectionEnd,
    } : null;
    console.log(activeElement, focusInfo)
    console.warn("commitRoot", globalState.wipRoot)
    globalState.deletions.forEach(commitWork);
    commitWork(globalState.wipRoot?.child);
    
     if (focusInfo && document.contains(focusInfo.element)) {
        (focusInfo.element as HTMLElement).focus();
        
        if (focusInfo.element instanceof HTMLInputElement || focusInfo.element instanceof HTMLTextAreaElement) {
            if (focusInfo.selectionStart !== null && focusInfo.selectionEnd !== null) {
                focusInfo.element.setSelectionRange(focusInfo.selectionStart, focusInfo.selectionEnd);
            }
        }
    }
  
    globalState.currentRoot = globalState.wipRoot;
    globalState.wipRoot = null;
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
        console.log("Placing", fiber.type, fiber.dom);
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
        if (domParent.contains(fiber.dom)) 
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
  
  const children = [fiber.type(fiber.props)].filter(child => 
        child !== null  && child !== undefined
    );
  console.warn(children)
//   console.log("Function component", fiber.type, children)
   console.log("Amount of children", children.length)
  recouncilChildren(children, fiber)
}

function updateHostComponent(fiber : FiberNode) {
  if (!fiber.dom) {
    fiber.dom = fiber.type !== "frag" ? createDom(fiber) : fiber.parent?.dom
  }
     console.warn("Amount of children", (fiber.props.children || []).length)

  recouncilChildren(fiber.props.children?.filter(e=> e != null && e !== undefined) || [], fiber);
}