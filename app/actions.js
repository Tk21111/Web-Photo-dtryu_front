"use server"
import { revalidateTag } from "next/cache";
import Project from "./model/Drive"
import { connectToDatabase } from "./lib/mongodb";

// MongoDB Change Stream
await connectToDatabase();
const changeStream = Project.watch();
changeStream.on("change", () => {
  console.log("MongoDB Data Updated! 🔄");
  revalidateTag("projs"); // Revalidate cache
});