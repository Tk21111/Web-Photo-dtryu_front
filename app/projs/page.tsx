import List from "../components/List";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/projpublic`, {
        cache: "force-cache", // Disable caching
        next : {tags : ["projs"] , revalidate : 10}
        
      });
  
      // Check if the response is OK (status code 200)
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }
      
      // Check if the response body is empty
      const projs : Proj[]= await res.json(); // Read as text first
    

  
  
      return (
        <div className="py-10 ">
           
          <h2 className="justify-center text-3xl font-bold my-2">All Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-box shadow-md py-20 transition delay-150 duration-300 ease-in-out">
            {projs.length > 0 ? (
                projs.map((proj) => (
                  <List key={proj._id} proj={proj}/>
                ))
            ) : (
                <p>No projects found.</p>
            )}
          </div>
          
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