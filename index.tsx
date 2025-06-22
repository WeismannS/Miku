import * as Miku from "./src/Factory/Factory.ts";
import { workLoop } from "./src/render/render.ts";
const aa = document.body.querySelector("#app");

function List({ username } :{username : string}) {
    console.log(username);
    return (
        <>
            <li>Annual New Year Poetry Reading</li>
            <li>Spring and Autumn Garden Parties LOL WORKED</li>
            <li>State visits and diplomatic functions</li>
            <li>Cultural preservation initiatives</li>
            <li>Disaster relief and humanitarian activities</li>
        </>
    );
}
function Header() {
    return (
        <div  className="hello">
            <h1>First Section of the Imperial Family</h1>
            <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book. It has
                survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged. It was
                popularised in the 1960s with the release of Letraset sheets
                containing Lorem Ipsum passages, and more recently with desktop
                publishing software like Aldus PageMaker including versions of
                Lorem Ipsum.
            </p>
            <ul>
                <li>
                    Emperor Akihito - Reigned from 1989 to 2019, known for his
                    dedication to peace and humanitarian causes
                </li>
                <li>
                    Emperor Naruhito - Current emperor since 2019, focused on
                    environmental conservation and water management
                </li>
                <li>
                    Crown Prince Fumihito - Heir apparent, known for his
                    ornithological research and conservation work
                </li>
                <li>
                    Princess Aiko - Daughter of Emperor Naruhito, currently
                    studying at Gakushuin University
                </li>
            </ul>

            <h2>Second Section: Historical Context</h2>
            <p>
                The Japanese Imperial Family is the oldest continuing
                monarchical family in the world. With a lineage that traces back
                over 2,000 years, the imperial institution has survived through
                numerous political changes, wars, and social transformations.
                The modern constitutional monarchy system established after
                World War II has redefined the role of the emperor as a symbol
                of the state and unity of the people.
            </p>

            <h2>Third Section: Cultural Significance</h2>
            <p>
                Beyond their ceremonial duties, members of the imperial family
                play crucial roles in preserving Japanese culture and
                traditions. They participate in seasonal festivals, maintain
                ancient rituals, and serve as patrons of arts and sciences.
                Their influence extends to international diplomacy, where they
                represent Japan's cultural heritage on the global stage.
            </p>

            <ul>
                <List username="hello" />{" "}
            </ul>
        </div>
    );
}

<h1></h1>;
if (aa) Miku.render(Header(), aa);


requestIdleCallback(workLoop)