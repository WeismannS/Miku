import {
    VNode,
    FiberNode,
    MikuAttributes,
    Props,
    FunctionComponent,
    TextVNode,
} from "../types/types";
import { isTextNode, setAttributes } from "../utils/utils";
import { render } from "../render/render";

function createElement(
    elm: FunctionComponent | string,
    props: MikuAttributes | null,
    ...children: (VNode | string | boolean | number)[]
): VNode | TextVNode {
    const properties = {
        children: children.length > 0 ? children.flat(Infinity).map(e=> {
          if (typeof e != "object")
              return { type: "TEXT_NODE", props: {nodeValue : e || "e"} }
          return e;
        }) : undefined,
        ...(props || {}),
    } as Props;
        return {
            type: elm ,
            props: properties
        };
    }


const Fragment: FunctionComponent = (props: Props) => {
    return {
        type: "frag",
        props,
    };
};

export { Fragment, createElement, render };
