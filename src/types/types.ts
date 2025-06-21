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
    sibling?: FiberNode;
    child?: FiberNode;
    parent?: FiberNode;
    alternate?: FiberNode;
}

export type FunctionComponent = (props: Props) => VNode;
