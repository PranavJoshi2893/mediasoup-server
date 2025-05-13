import express from "express";
import * as http from "node:http";
import * as WebSocket from "ws";
import { webSocketConnection } from "./mediasoup-lib/ws";

export async function main() {
  const app = express();
  const server = http.createServer(app);

  const websocket = new WebSocket.Server({ server, path: "/ws" });

  webSocketConnection(websocket);

  const PORT = 3000;
  const HOST = "localhost";

  server.listen(PORT, HOST, () => {
    console.log(`ws://${HOST}:${PORT}`);
  });
}
