import * as utils from '@dcl/ecs-scene-utils'
import { getUserPublicKey } from "@decentraland/Identity";
import {
  WebsocketMessage,
  WebsocketImageStreamMessageRequest,
  WebsocketImageStreamMessageResponse,
} from "./domain";

export let socket: WebSocket;
export let imageStreamSocket: WebSocket;

export let userId: any;
export const messageBus = new MessageBus();

var machines:any = {};

export function socketRegister(id:any, v:any) {
  machines[id] = v;
}

// connect to wss endpoint
joinSocketServer("dcl.pixelmind.ai", "abc123");
joinSocketServerScreen("dcl.pixelmind.ai", "abc123");

async function joinSocketServer(host: string, scene: string) {
  userId = await getUserPublicKey();
  log("userId", userId);
  if (!userId) userId = Date.now().toString();
  // if (!userId) userId = "guestuser";

  socket = new WebSocket(
    `wss://${host}/connect?scene=${scene}&identity=${userId}`
  );
  socket.onopen = (event) => {
    log("Websocket connection open");
    // get session
    const message: WebsocketMessage = {
      type: "getsession",
      target: userId,
      data: "",
    };
    socket.send(JSON.stringify(message));
  };
  socket.onclose = (event) => {
    log("Websocket connection closed");
    let delay = new Entity()
    engine.addEntity(delay)
    delay.addComponent(new utils.Delay(10000,()=>{
      joinSocketServer(host, scene);
    }))
  };
  socket.onmessage = (event) => {
    // address and forward to message bus
    try {
      const message: WebsocketMessage = JSON.parse(event.data);
      if (message.type === "getsession") {
        // "getsession" messages get forwarded to all arcade machines
        Object.keys(machines).forEach((k) => {
          machines[k].incomingMessage(message);
        });
      } else {
        // forward message to target machine
        machines[message.target].incomingMessage(message);
      }
    } catch (e) {
      log("error", e);
    }
  };
}

function joinSocketServerScreen(host: string, scene: string) {
  imageStreamSocket = new WebSocket(`wss://${host}/images?scene=${scene}`);
  imageStreamSocket.onopen = (event) => {
    log("Websocket connection open");
    // get session
    const message: WebsocketImageStreamMessageRequest = {
      type: "getallimages",
      arguments: [],
      filter: [],
    };
    imageStreamSocket.send(JSON.stringify(message));
  };
  imageStreamSocket.onclose = (event) => {
    log("Websocket connection closed");
  };
  imageStreamSocket.onmessage = (event) => {
    // address and forward to message bus
    try {
      const message: WebsocketImageStreamMessageResponse = JSON.parse(
        event.data
      );
      log(`socket.imagestream.onmessage: ${message.type}`, message.data);
    } catch (e) {
      log("error", e);
    }
  };
}
