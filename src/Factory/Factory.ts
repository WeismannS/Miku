import {
    VNode,
    FiberNode,
    MikuAttributes,
    Props,
    FunctionComponent,
} from "../types/types";

function render(elm: VNode | string, container: HTMLElement | Text | Element) {
    if (typeof elm == "string") {
        container.appendChild(document.createTextNode(elm));
        return;
    }
    if (elm.type == "frag") {
        if (elm.props.children) {
            for (let child of elm.props.children) render(child, container);
        }
        return;
    }
    const element = document.createElement(elm.type);
    for (let [key, value] of Object.entries(elm.props)) {
        if (key === "children") continue;
        if (typeof value == "boolean" && value == true)
            (element as HTMLElement).setAttribute(key, "");
        else if (typeof value !== "boolean")
            (element as HTMLElement).setAttribute(key, String(value));
    }
    if (elm.props.children) {
        for (let child of elm.props.children) render(child, element);
    }
    container.appendChild(element);
}

function createElement(
    elm: FunctionComponent | string,
    props: MikuAttributes | null,
    ...children: (VNode | string)[]
): VNode {
    const properties = {
        children: children.length > 0 ? children : undefined,
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
