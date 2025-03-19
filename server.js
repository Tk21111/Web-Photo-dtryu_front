import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import Drive from "./app/model/Drive.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  // MongoDB Change Stream
  const changeStream = Drive.watch();

  changeStream.on("change", (change) => {
    console.log("MongoDB Data Changed:", change);
    io.emit("change", change); // Notify all clients
  });
  io.on("connection", (socket)=>{
      console.log("client connect" , socket.id)
  })

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});