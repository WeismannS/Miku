export type Props = {
    children?:  VNode[];
    nodeValue?: string;
    [key: string]:  any
} & MikuAttributes;

export type MikuAttributes = {
    [k: string]: any
} | {}; 

export type VNode = {
    type: string | FunctionComponent;
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
    effectTag?: "UPDATE" | "PLACEMENT" | "DELETION" | null;
    hooks? : any[];
    hookIndex : number;
}


export type Maybe<T>  = T | undefined | null
export type FunctionComponent = (props: Props) => VNode;
