import List from "../components/List";

type Proj = {
    _id: string;
    name: string;
    user: string;
    status: string;
    locationOnDisk: string;
    locationOnDrive: string;
    size: number;
    timeReqFullfill: number;
  };
  
  export default async function Projs() {
    try {
      const res = await fetch("http://localhost:3000/api/users", {
        cache: "no-store", // Disable caching
      });
  
      // Check if the response is OK (status code 200)
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }
  
      // Check if the response body is empty
      const projs : Proj[]= await res.json(); // Read as text first
      console.log(projs)

  
  
      return (
        <div className="py-10">
            <form className="mb-4">
                <input type="text" name="projName" required className="border p-2 mr-2"/>
                <button type="submit" className="btn-accent bg-blue-600 p-2 rounded-lg">add proj</button>
            </form>
          <h2>All Projects</h2>
          <ul className="list bg-base-100 rounded-box shadow-md">
            {projs.length > 0 ? (
                projs.map((proj) => (
                  <List key={proj._id} proj={proj}/>
                ))
            ) : (
                <p>No projects found.</p>
            )}
          </ul>
          
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