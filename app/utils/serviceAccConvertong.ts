import Rawi from "../components/rawi.png";
import BlackCat from "../components/blackcat.png";
import ColorCat from "../components/colorfulcat.png";
import Tk from "../components/tk.jpg";


const serviceAccInfo = [
    ["Black cat" , "bg-black" , BlackCat],
    ["Colorful cat" , "bg-black" , ColorCat],
    ["Ri " , "bg-red-400" , Rawi],
    ["Tk" , "bg-blue-400" , Tk],
    ["gussy" , "bg-pink-400" ,""],
    ["I June" , "bg-orange-400" , ""],
    ["I Jun" , "bg-orange-400" , ""],
]

export default function serviceAccConverter(serviceAccId : number) {
    return serviceAccInfo[serviceAccId]
}

export {serviceAccInfo}