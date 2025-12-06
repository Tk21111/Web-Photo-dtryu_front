// // lib/mongooseNew.ts
// import mongoose from "mongoose";

// const DATABASE_URL_NEW = process.env.DATABASE_URL_NEW; // points to newdb
// let cached = global.mongooseNew;

// if (!cached) {
//   cached = global.mongooseNew = { conn: null, promise: null };
// }

// export async function connectToNewDatabase() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(DATABASE_URL_NEW).then((mongoose) => mongoose);
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }
