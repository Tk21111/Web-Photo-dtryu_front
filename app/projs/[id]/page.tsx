import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

  
  export default async function ProjsChild() {

    const param = useParams<{id : string}>();
    const searchParams = useSearchParams();
    const tag = searchParams.get("tag")?.split(",")
    
    try {
    
      return (
        <div className="py-10 ">
           
          
            <Suspense fallback={<div>Loading...</div>}>
            </Suspense>
        </div>
      );
    } catch (error) {
      // Handle errors (network issues, bad JSON, etc.)
      console.error("Error fetching projects:", error);
      return <p>Error fetching projects. Please try again later.</p>;
    }
  }