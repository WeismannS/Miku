import Miku from "../index";
import { FunctionComponent, Props } from "../types/types";

export function Router({
	path,
	Component,
	...rest
}: {
	path: string;
	Component: FunctionComponent;
	[key: string]: any;
}) {
	const url = new URL(window.location.href);
	const slugs = path.split("/").filter((s) => s.trim().length > 0);
	const currentSlugs = url.pathname
		.split("/")
		.filter((s) => s.trim().length > 0);
	if (
		currentSlugs.length === slugs.length &&
		currentSlugs.every(
			(e, i) =>
				e.toLowerCase() == slugs[i]?.toLowerCase() || slugs[i]?.startsWith(":"),
		)
	) {
		return <Component {...rest} />;
	}
	return null;
}

export function Link({ to, children, ...rest }: Props) {
	const setRender = Miku.useRender();
	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		window.history.pushState({}, "", to);
		setRender(null);
	};

	return (
		<a href={to} onClick={handleClick} {...rest}>
			{children}
		</a>
	);
}

export function redirect(to: string) {
	window.history.pushState({}, "", to);
	Miku.useRender()(null);
}
