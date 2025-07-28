import Miku,{ useState, useRef, useEffect } from "Miku";
import { workLoop } from "../../src/render/render.ts";
const aa = document.body.querySelector("#app");
interface AccordionItem {
  id: number;
  title: string;
  content: string;
}

const data: AccordionItem[] = [
  { id: 1, title: "Section 1", content: "Content for section 1" },
  { id: 2, title: "Section 2", content: "Content for section 2" },
  { id: 3, title: "Section 3", content: "Content for section 3" },
];

export default function AccordionApp() {
  const [openId, setOpenId] = useState<number | null>(null);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const toggle = (id: number): void => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    Object.entries(contentRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const numericKey = parseInt(key);
      if (numericKey === openId) {
        el.style.maxHeight = el.scrollHeight + "px";
        el.style.paddingTop = "1rem";
        el.style.paddingBottom = "1rem";
      } else {
        el.style.maxHeight = "0px";
        el.style.paddingTop = "0px";
        el.style.paddingBottom = "0px";
      }
    });
  }, [openId]);

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-4">
      {data.map(({ id, title, content }) => (
        <div key={id} className="border rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(id)}
            className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-medium"
          >
            {title}
          </button>
          <div
            ref={(el) => {
                (contentRefs.current[id] = el)
            }}
            className="transition-all duration-300 overflow-hidden px-4 bg-white"
            style={{ maxHeight: 0, paddingTop: 0, paddingBottom: 0 }}
          >
            <p>{content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


if (aa) Miku.render(<AccordionApp />, aa);


requestIdleCallback(workLoop)