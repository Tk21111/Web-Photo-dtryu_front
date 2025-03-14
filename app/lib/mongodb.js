import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

let cached = global.mongoose;

//NO RE connect

if(!cached){
    cached = global.mongoose = {conn : null , promise : null};
}

export async function connectToDatabase() {

    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        cached.promise = mongoose.connect(DATABASE_URL , { useNewUrlParser : true , useUnifiedTopology : true}).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
