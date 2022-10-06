export interface WebsocketMessage {
  type: string;
  target: string;
  data:
    | string
    | PixelmindImage
    | PixelmindArcadeSession
    | PixelmindArcadeMachineState;
}
export interface WebsocketImageStreamMessageRequest {
  type: string;
  arguments: Array<string>;
  filter: Array<string>;
}
export interface WebsocketImageStreamMessageResponse {
  type: string;
  data: PixelmindImage | Array<PixelmindImage>;
}
export interface PixelmindImage {
  id: number;
  title: string;
  prompt: string;
  percent_complete: float;
  status: string;
  queue_position: number;
  file_url: string;
  thumb_url: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
}
export interface PixelmindArcadeMachineState {
  id: string;
  active: boolean;
  activeUser: string;
  busy: boolean;
  image: any;
}
export interface PixelmindArcadeSession {
  scene: string;
  machines: Array<PixelmindArcadeMachineState>;
}
export interface MessageBusArcadeMachineInteraction {
  active: boolean;
  target: string;
  user: string;
}
export interface MessageBusArcadeMachineBusy {
  busy: boolean;
  target: string;
  user: string;
}
