// models/ProjNew.ts
import mongoose from "mongoose";

const Proj = new mongoose.Schema({
  name: String,
  tags: [String],
  proj_id: String,
  parent_folder: String,
});

export default mongoose.models.Proj || mongoose.model("proj", Proj);
