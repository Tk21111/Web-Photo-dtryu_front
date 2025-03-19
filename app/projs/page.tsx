import List from "../components/List";
import socket from "socket.io-client";
import ProjList from "./ProjList";
type Proj = {
  _id: string;
  name: string;
  user: string;
  status: string;
  locationOnDisk: string;
  locationOnDrive: string;
  size: number;
  timeReqFullfill: string;
  originalTime :string;
  serviceAcc : number;
};
  
  export default async function Projs() {
    try {
    
      return (
        <div className="py-10 ">
           
          <h2 className="justify-center text-3xl font-bold my-2">All Projects</h2>
            <ProjList/>
        </div>
      );
    } catch (error) {
      // Handle errors (network issues, bad JSON, etc.)
      console.error("Error fetching projects:", error);
      return <p>Error fetching projects. Please try again later.</p>;
    }
  }
  

  /*
  <>
                      <List key={proj._id} proj={proj}/>
                    </>
  */