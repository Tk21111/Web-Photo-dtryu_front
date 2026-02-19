import { Suspense } from "react";
import ProjList from "./ProjList";

  
  export default async function Projs() {
    try {
    
      return (
        <div className="py-10 ">
           
          
            <Suspense fallback={<div>Loading...</div>}>
                <ProjList />
            </Suspense>
        </div>
      );
    } catch (error) {
      // Handle errors (network issues, bad JSON, etc.)
      console.error("Error fetching projects:", error);
      return <p>Error fetching projects. Please try again later.</p>;
    }
  }