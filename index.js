"use strict";
function render(elm, container) {
    if (typeof elm == "string") {
        container.appendChild(document.createTextNode(elm));
        return;
    }
    if (elm.type == "frag") {
        if (elm.props.children) {
            for (let child of elm.props.children)
                render(child, container);
        }
        return;
    }
    const element = document.createElement(elm.type);
    for (let [key, value] of Object.entries(elm.props)) {
        if (key === "children")
            continue;
        if (typeof value == "boolean" && value == true)
            element.setAttribute(key, "");
        else if (typeof value !== "boolean")
            element.setAttribute(key, String(value));
    }
    if (elm.props.children) {
        for (let child of elm.props.children)
            render(child, element);
    }
    container.appendChild(element);
}
function createElement(elm, props, ...children) {
    const properties = {
        children: children.length > 0 ? children : undefined,
        ...props,
    };
    if (typeof elm == "function")
        return elm(properties);
    else {
        return {
            type: elm,
            props: properties,
        };
    }
}
const Fragment = (props) => {
    return {
        type: "frag",
        props,
    };
};
const Miku = {
    createElement,
    Fragment,
};
const aa = document.body.querySelector("#app");
function List({ username }) {
    console.log(username);
    return (Miku.createElement(Miku.Fragment, null,
        Miku.createElement("li", null, "Annual New Year Poetry Reading"),
        Miku.createElement("li", null, "Spring and Autumn Garden Parties LOL WORKED"),
        Miku.createElement("li", null, "State visits and diplomatic functions"),
        Miku.createElement("li", null, "Cultural preservation initiatives"),
        Miku.createElement("li", null, "Disaster relief and humanitarian activities")));
}
function Header() {
    return (Miku.createElement("div", { onClick: () => console.log("hello") },
        Miku.createElement("h1", null, "First Section of the Imperial Family"),
        Miku.createElement("p", null, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."),
        Miku.createElement("ul", null,
            Miku.createElement("li", null, "Emperor Akihito - Reigned from 1989 to 2019, known for his dedication to peace and humanitarian causes"),
            Miku.createElement("li", null, "Emperor Naruhito - Current emperor since 2019, focused on environmental conservation and water management"),
            Miku.createElement("li", null, "Crown Prince Fumihito - Heir apparent, known for his ornithological research and conservation work"),
            Miku.createElement("li", null, "Princess Aiko - Daughter of Emperor Naruhito, currently studying at Gakushuin University")),
        Miku.createElement("h2", null, "Second Section: Historical Context"),
        Miku.createElement("p", null, "The Japanese Imperial Family is the oldest continuing monarchical family in the world. With a lineage that traces back over 2,000 years, the imperial institution has survived through numerous political changes, wars, and social transformations. The modern constitutional monarchy system established after World War II has redefined the role of the emperor as a symbol of the state and unity of the people."),
        Miku.createElement("h2", null, "Third Section: Cultural Significance"),
        Miku.createElement("p", null, "Beyond their ceremonial duties, members of the imperial family play crucial roles in preserving Japanese culture and traditions. They participate in seasonal festivals, maintain ancient rituals, and serve as patrons of arts and sciences. Their influence extends to international diplomacy, where they represent Japan's cultural heritage on the global stage."),
        Miku.createElement("ul", null,
            Miku.createElement(List, { checked: true, username: "hello" }),
            " ")));
}
Miku.createElement("h1", null);
if (aa)
    render(Header(), aa);
