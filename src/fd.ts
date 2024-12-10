import { type RequestListener, createServer } from "node:http";
console.log(process.env);

const SD_LISTEN_FDS_START = 3;
const handler: RequestListener = (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Unix Socket Server\n");
};
const fds = Number(process.env.LISTEN_FDS);

for (let i = 0; i < fds; i++) {
  const server = createServer(handler);
  server.on("listening", () => {
    console.log("listening", server.address());
  });
  server.listen({ fd: SD_LISTEN_FDS_START + i });
}
