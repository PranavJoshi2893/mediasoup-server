import { createWorker } from "./worker";
import WebSocket from "ws";
import { createWebRtcTransport } from "./createWebRtcTransport";
import { Router, Producer, Transport } from "mediasoup/node/lib/types";

let mediasoupRouter: Router;
let producerTransport: Transport;
let producer: Producer

async function webSocketConnection(websock: WebSocket.Server) {
  try {
    mediasoupRouter = await createWorker();
  } catch (err) {
    throw err;
  }
  websock.on("connection", (ws: WebSocket) => {
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
        case "createProducerTransport":
          onCreateProducerTransport(event, ws);
          break;
        case "connectProducerTransport":
          onConnectProducerTransport(event, ws)
          break;
        case "produce":
          onProduce(event, ws, websock)
          break
        default:
          break;
      }
    });
  });

  async function onProduce(event: any, ws: WebSocket, websock: WebSocket.Server) {
    const { kind, rtpParameters } = event
    producer = await producerTransport.produce({ kind, rtpParameters })
    const resp = {
      id: producer.id,
    }
    send(ws, "produced", resp);
    broadcast(websock, 'newProducer', 'new user')
  }

  async function onConnectProducerTransport(event: any, ws: WebSocket) {
    await producerTransport.connect({ dtlsParameters: event.dtlsParameters })
    send(ws, "producerConnected", 'producer connected')
  }

  function onRouterRtpCapabilities(event: string, ws: WebSocket) {
    send(ws, "routerCapabilities", mediasoupRouter.rtpCapabilities);
  }

  async function onCreateProducerTransport(event: string, ws: WebSocket) {
    try {
      const { transport, params } = await createWebRtcTransport(mediasoupRouter)
      producerTransport = transport;
      send(ws, "producerTransportCreated", params)
    } catch (err) {
      console.error(err)
      send(ws, "error", err)
    }
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

  function broadcast(ws: WebSocket.Server, type: string, msg: any) {
    const message = {
      type,
      data: msg
    }
    const resp = JSON.stringify(message);
    ws.clients.forEach((client) => {
      client.send(resp)
    })
  }
}

export { webSocketConnection };
