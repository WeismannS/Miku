import { FunctionComponent, Props } from "../types/types";
import Miku from "../index";



export  function Router({path, Component, ...rest}: {path: string, Component: FunctionComponent, [key: string]: any}) {
  const url = new URL(window.location.href);
  const slugs = path.split("/") 
  const currentSlugs = url.pathname.split("/")
  console.log("Current URL:", url.pathname);

  if (currentSlugs.every((e, i) => e.toLowerCase() == slugs[i]?.toLowerCase() || slugs[i]?.startsWith(":"))) {
    {
      // console.log("slugs", currentSlugs)
      // console.log("Rendering component for path:", path);
      return <Component  {...rest} />;
    }
  }
  return null;
}


export function Link({to, children, ...rest}: Props) {
    const setRender = Miku.useRender();
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState({}, "", to);
    setRender(null);
    };

  return <a href={to} onClick={handleClick} {...rest}>{children}</a>;
}

export function redirect(to: string) {
  window.history.pushState({}, "", to);
  Miku.useRender()(null);
}

