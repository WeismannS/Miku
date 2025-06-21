import {
    VNode,
    FiberNode,
    MikuAttributes,
    Props,
    FunctionComponent,
    TextVNode,
} from "../types/types";
import { isTextNode, setAttributes } from "../utils/utils";



function render(elm: VNode | TextVNode, container: HTMLElement | Text | Element) {
    if (isTextNode(elm)) {
        container.appendChild(document.createTextNode(elm.props.nodeValue));
        return;
    }
    if (elm.type == "frag") {
        if (elm.props.children) {
            for (let child of elm.props.children) render(child, container);
        }
        return;
    }
    const element = document.createElement(elm.type);
    setAttributes(element, elm.props)
    if (elm.props.children) {
        for (let child of elm.props.children) render(child, element);
    }
    container.appendChild(element);
}

function createElement(
    elm: FunctionComponent | string,
    props: MikuAttributes | null,
    ...children: (VNode | string)[]
): VNode | TextVNode {
    const properties = {
        children: children.length > 0 ? children.map(e=> {
          if (typeof e == "string")
              return { type: "TEXT_NODE", props: {nodeValue : e} }
          return e;
        }) : undefined,
        ...(props || {}),
    } as Props;
    if (typeof elm == "function") return elm(properties);
    else {
        return {
            type: elm,
            props: properties,
        };
    }
}

const Fragment: FunctionComponent = (props: Props) => {
    return {
        type: "frag",
        props,
    };
};

export { Fragment, createElement, render };
