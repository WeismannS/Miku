import {
    VNode,
    FiberNode,
    MikuAttributes,
    Props,
    FunctionComponent,
    TextVNode,
} from "../types/types";
import { isTextNode, setAttributes } from "../utils/utils.ts";
import { render } from "../render/render.ts";

function createElement(
    elm: FunctionComponent | string,
    props: MikuAttributes | null,
    ...children: (VNode | string)[]
): VNode | TextVNode {
    const properties = {
        children: children.length > 0 ? children.flat(Infinity).map(e=> {
          if (typeof e != "object")
              return { type: "TEXT_NODE", props: {nodeValue : e || ""} }
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
