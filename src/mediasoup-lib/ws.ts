import { Router } from "mediasoup/node/lib/types";
import { createWorker } from "./worker";
import WebSocket from "ws";

let mediasoupRouter: Router;

async function webSocketConnection(websocket: WebSocket.Server) {
  try {
    mediasoupRouter = await createWorker();
  } catch (err) {
    throw err;
  }
  websocket.on("connection", (ws: WebSocket) => {
    ws.on("message", (message: string) => {
      const jsonValidation = IsJsonString(message);
      if (!jsonValidation) {
        console.error("json error");
        return;
      }

      const event = JSON.parse(message);

      switch (event.type) {
        case "getRouterRtpCapabilities":
          onRouterRtpCapabilities(event, ws);
          break;
        default:
          break;
      }
    });
  });

  function onRouterRtpCapabilities(event: String, ws: WebSocket) {
    send(ws, "routerCapabilities", mediasoupRouter.rtpCapabilities);
  }

  function IsJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (err) {
      return false;
    }

    return true;
  }

  function send(ws: WebSocket, type: string, msg: any) {
    const message = {
      type,
      data: msg,
    };

    const resp = JSON.stringify(message);
    ws.send(resp);
  }
}

export { webSocketConnection };
