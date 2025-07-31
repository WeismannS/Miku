import { FunctionComponent, Props } from "../types/types.ts";
import Miku from "../index.ts";



export  function Router({path, Component}: {path: string, Component: FunctionComponent}) {
  const url = new URL(window.location.href);
  const slugs = path.split("/")
  const currentSlugs = url.pathname.split("/")
  console.log("Current URL:", url.pathname);

  if (currentSlugs.every((e, i) => e.toLowerCase() == slugs[i]?.toLowerCase() || slugs[i]?.startsWith(":"))) {
    {
      console.log("slugs", currentSlugs)
      console.log("Rendering component for path:", path);
      return <Component />;
    }
  }
  return null;
}


export function Link({to, children}: Props) {
    const setRender = Miku.useRender();
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState({}, "", to);
    setRender(null);
    };

  return <a href={to} onClick={handleClick}>{children}</a>;
}

const foo = [1,2,3,5]  


let i = 0;




const bar = foo[i] as number |undefined