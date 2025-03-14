import React from "react";

type Proj = {
  user: string;
  _id: string;
};


const UsersPage = async () => {

    await new Promise((resolve) => setTimeout(resolve , 2000));
    const res = await fetch("http://localhost:3101/req", { cache: "default" , method : "GET"}); // No caching (SSR)
    const users = await res.json();
    
  return (
    <div>
      <h2>Server-Side Rendered Users</h2>
      {users.map((proj : Proj) => (
        <div key={proj._id}>
          <p>{proj.user}</p>
        </div>
      ))}
    </div>
  );
};

export default UsersPage;
