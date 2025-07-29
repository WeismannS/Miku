import Miku from "../index.ts";



export default function useRender(){
    const [_, setRender] = Miku.useState(null);
    return setRender;
}