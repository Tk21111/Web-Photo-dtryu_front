import Rawi from "../components/rawi.png";
import BlackCat from "../components/blackcat.png";
import ColorCat from "../components/colorfulcat.png";
import Tk from "../components/tk.jpg";




export default function serviceAccConverter(serviceAccId : number) {
    const serviceAccInfo = [
        ["Black cat" , "bg-black" , BlackCat],
        ["Colorful cat" , "bg-black" , ColorCat],
        ["Ri " , "bg-red-400" , Rawi],
        ["Tk" , "bg-blue-400" , Tk],
        ["I June" , "bg-pink-400"],
        ["I junki" , "bg-orange-400"],
    ]

    return serviceAccInfo[serviceAccId]
}