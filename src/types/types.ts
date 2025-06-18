export type Props = {
    children?: (string | VNode)[];
} & MikuAttributes;

export type MikuAttributes = {
    [k: string]: string | number | boolean;
} | {}; 

export type VNode = {
    type: string;
    props: Props;
};

export interface FiberNode extends VNode {
    sibling?: FiberNode;
    child?: FiberNode;
    parent?: FiberNode;
    alternate?: FiberNode;

}

export type FunctionComponent = (props: Props) => VNode;
