import Miku from "../index";



export default function useRender(){
    const [_, setRender] = Miku.useState(null);
    return setRender;
}