import { promptUI, promptInput } from "./ui";
import {
  WebsocketMessage,
  PixelmindArcadeMachineState,
  MessageBusArcadeMachineInteraction,
} from "./domain";
import { messageBus, socket } from "./socket";
import * as ui from '@dcl/ui-scene-utils'

export function toggleUI(target:any) {
  promptUI.visible = !promptUI.visible;
  promptUI.isPointerBlocker = !promptUI.isPointerBlocker;
  // send prompt input over socket
  promptInput.onTextSubmit = new OnTextSubmit((x) => {
    const message: WebsocketMessage = {
      type: "submitprompt",
      target: target,
      data: x.text,
    };
    socket.send(JSON.stringify(message));
    promptUI.visible = false;
    promptUI.isPointerBlocker = false;
    promptInput.visible = false
    ui.displayAnnouncement("AI Generation in progress...")
  });
}

export function broadcastActive(state: PixelmindArcadeMachineState) {
  // broadcast on message bus
  const interaction: MessageBusArcadeMachineInteraction = {
    active: state.active,
    target: state.id,
    user: state.activeUser,
  };
  messageBus.emit("active", interaction);
  // propagate to backend
  const message: WebsocketMessage = {
    type: "updatemachinestate",
    target: state.id,
    data: state,
  };
  socket.send(JSON.stringify(message));
}

export function broadcastBusy(state: PixelmindArcadeMachineState) {
  // broadcast on message bus
  const interaction: MessageBusArcadeMachineInteraction = {
    active: state.active,
    target: state.id,
    user: state.activeUser,
  };
  messageBus.emit("busy", interaction);
  // propagate to backend
  const message: WebsocketMessage = {
    type: "updatemachinestate",
    target: state.id,
    data: state,
  };
  socket.send(JSON.stringify(message));
}
