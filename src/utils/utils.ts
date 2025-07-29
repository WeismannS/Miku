import { Props, TextVNode, VNode } from "../types/types";

export function setAttributes(elm: Element, props: Props, oldProps?: Props) {
  if (oldProps) {
    for (let [key, value] of Object.entries(oldProps)) {
      if (key === "children") continue;
      if (key.startsWith("on") && isEventListener(key)) {
        console.log("Removing old event listener", key, value);
        const eventName = key.slice(2).toLowerCase();
        elm.removeEventListener(eventName, value as EventListener);
      }
    }
  }

  for (let [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (typeof value == "boolean" && value == true) {
      elm.setAttribute(key, "");
    } else if (key.startsWith("on")) {
      console.log("Adding event listener", key, value);
      const eventName = key.slice(2).toLowerCase();
      elm.addEventListener(eventName, value as EventListener);
    } else if (key === "nodeValue" && elm.nodeType == Node.TEXT_NODE) {
      (elm as unknown as Text).nodeValue = value as string;
    }
      else if (key == "ref")
      {
        if (typeof value === "function") {
          value(elm);
        } else if (value && typeof value === "object" && "current" in value) {
          value.current = elm;
        } else {
          console.warn("Invalid ref type", value);
        }
      }
     else if (typeof value !== "boolean") {
      console.log("Setting attribute", key, value);
      if (key == "className")
        elm.setAttribute("class", String(value));
      else if (key == "style" && typeof value === "object"){
        elm.setAttribute("style", parseStyleObject(value));
      }
      else
        elm.setAttribute(key, String(value));
    }
  }
}



function camelToKebab(str : string) {
  return str.replace(/[A-Z]/g, (letter : string) => `-${letter.toLowerCase()}`)
}
const unitlessProperties = new Set([
  'zIndex', 'opacity', 'fontWeight', 'lineHeight', 'flex', 
  'flexGrow', 'flexShrink', 'order', 'animationIterationCount'
])

function formatValue(property : string, value : any): string {
  if (typeof value === 'number') {
    return unitlessProperties.has(property) ? value.toString() : `${value}px`
  }
  return value
}


function parseStyleObject(styleObj : Record<string, any> | null): string {
  if (!styleObj) return ''
  
  return Object.entries(styleObj)
    .map(([property, value]) => {
      const cssProperty = camelToKebab(property)
      const cssValue = formatValue(property, value)
      return `${cssProperty}: ${cssValue}`
    })
    .join('; ')
}

export function isEventListener(event: string): boolean {
  return event.startsWith("on") && event.length > 2;
}

export function isTextNode(elm: VNode | TextVNode): elm is TextVNode {
  return elm.type == "TEXT_NODE";
}