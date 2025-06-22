export type Props = {
    children?:  VNode[];
    nodeValue?: string;
} & MikuAttributes;

export type MikuAttributes = {
    [k: string]: string | number | boolean | bigint;
} | {}; 

export type VNode = {
    type: string;
    props: Props;
} 

export type TextVNode = {
    type: "TEXT_NODE";
    props : {
      nodeValue : string
    }
}
export interface FiberNode extends VNode {
    dom?: Element | Text | null;
    sibling?: FiberNode | null;
    child?: FiberNode | null;
    parent?: FiberNode | null;
    alternate?: FiberNode | null;
}


export type Maybe<T>  = T | undefined | null
export type FunctionComponent = (props: Props) => VNode;
