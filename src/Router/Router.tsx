import { FunctionComponent } from "../types/types.ts";
import Miku from "../index.ts";



export  function Router({path, Component}: {path: string, Component: FunctionComponent}) {
  const url = new URL(window.location.href);
  console.log("Current URL:", url.pathname);
  if (url.pathname === path)
    {
      console.log("Rendering component for path:", path);
      return <Component />;
    }
  return null;
}


export function Link({to, children}: {to: string, children: string}) {
    const setRender = Miku.useRender();
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState({}, "", to);
    setRender(null);
    };

  return <a href={to} onClick={handleClick}>{children}</a>;
}