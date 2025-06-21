import { Props, TextVNode, VNode } from "../types/types";

export function setAttributes(elm : Element, props : Props)
{
  for (let [key, value] of Object.entries(props)) {
      if (key === "children") continue;
      if (typeof value == "boolean" && value == true)
          elm.setAttribute(key, "");
      else if (typeof value !== "boolean")
          elm.setAttribute(key, String(value));
  }
}

export function isTextNode(elm : VNode | TextVNode) : elm is TextVNode
{
  return elm.type == "TEXT_NODE"
}