// import { MessageBusArcadeMachineBusy, MessageBusArcadeMachineInteraction, PixelmindArcadeMachineState } from "./domain";
// import { PixelmindArcadeSession, WebsocketMessage } from "./domain";
// import { broadcastActive, toggleUI } from "./functions";
// import { messageBus, socketRegister, userId } from "./socket";import { promptInput } from "./ui";
// import * as utils from '@dcl/ecs-scene-utils'


// const NOPUSER = "0000000000001";

// export class PixelMind extends Entity{
//     private id: string;
//     private active = false;
//     private activeUser = NOPUSER;
//     private busy = false;
//     private busyTimeout: number = 0;
//     private imageSource: string;
//     //private image: Entity;
//     //private imageBackSide: Entity;
//     private imageMaterial: Material;
  

// constructor(id:string, defaultImage:string, parent:Entity, transform: TranformConstructorArgs, trigger?: Vector3){
//     super(id)
//         this.id = id;
//         this.imageSource = defaultImage;
//         socketRegister(this.id, this);
    
//         messageBus.on("active", (message: MessageBusArcadeMachineInteraction) => {
//           if (message.user !== userId && message.target === this.id) {
//             this.active = message.active;
//             this.activeUser = message.user;
//           }
//         });
//         messageBus.on("busy", (message: MessageBusArcadeMachineBusy) => {
//           if (message.user !== userId && message.target === this.id) {
//             this.busy = message.busy;
//           }
//         });


//         this.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(3,3,3), new Vector3(0,.5,0)),{
//           enableDebug:false,
//           onCameraEnter:()=>{
//             this.interact()
//           },
//           onCameraExit:()=>{
//             promptInput.visible = false
//           }
//         }))
    
//         //const machine = new Entity('arcade-machine');
//         //machine.setParent(parent);
//         //machine.addComponent(new Transform({ position: new Vector3(0, 0, 0) }));
//         // machine.addComponent(new GLTFShape('./models/arcade_machine.glb'))
    
//         //this = new Entity();
//         //this.imageBackSide = new Entity();
//         this.imageMaterial = new Material();
    
//         this.imageMaterial.roughness = 1;
//         this.imageMaterial.metallic = 0;
//         this.imageMaterial.specularIntensity = 0;
    
//         let invisibleMaterial = new Material();
//         invisibleMaterial.albedoColor = new Color4(0, 0, 0, 0);
    
//         let clickPanel = new Entity();
//         let clickPanelBackSide = new Entity();
    
//         this.addComponent(new PlaneShape());
//         this.addComponent(
//           new Transform(transform)
//         );
//         this.addComponent(this.imageMaterial);
//         this.setParent(parent);
//         engine.addEntity(this)
    
//         /*
//         this.imageBackSide.addComponent(new PlaneShape());
//         this.imageBackSide.addComponent(
//           new Transform({
//             position: new Vector3(0, -0.2, 0.04),
//             scale: new Vector3(4.25, 4.25, 1),
//             rotation: Quaternion.Euler(0, 180, 180),
//           })
//         );
//         this.imageBackSide.addComponent(this.imageMaterial);
//         this.imageBackSide.setParent(parent);
//         */
    
//         clickPanel.addComponent(invisibleMaterial);
//         clickPanel.addComponent(new PlaneShape());
//         clickPanel.addComponent(
//           new Transform({
//             scale: new Vector3(5, 4.5, 1),
//             position: new Vector3(0, 0, -0.2),
//           })
//         );
//         clickPanel.setParent(parent);
//         clickPanel.addComponentOrReplace(
//           new OnPointerDown((e) => this.interact(), {
//             hoverText: "Interact",
//             distance: 5,
//           })
//         );
    
//         clickPanelBackSide.addComponent(invisibleMaterial);
//         clickPanelBackSide.addComponent(new PlaneShape());
//         clickPanelBackSide.addComponent(
//           new Transform({
//             scale: new Vector3(5, 4.5, 1),
//             position: new Vector3(0, 0, 0.2),
//           })
//         );
//         clickPanelBackSide.setParent(parent);
//         clickPanelBackSide.addComponentOrReplace(
//           new OnPointerDown((e) => this.interact(), {
//             hoverText: "Interact",
//             distance: 5,
//           })
//         );
//         this.displayImage(this.imageSource);
//     }

//     reset() {
//         this.active = false;
//         this.activeUser = NOPUSER;
//         this.busy = false;
//         this.busyTimeout = 0;
//       }
    
//       incomingMessage(message: WebsocketMessage) {
//         log(`${this.id} processing message ${message.type} => ${message.data}`);
//         try {
//           switch (message.type) {
//             case "getsession":
//               const session: PixelmindArcadeSession =
//                 message.data as PixelmindArcadeSession;
//               const state = session.machines.filter((v) => v.id === this.id)[0];
//               this.active = state.active;
//               this.activeUser = state.activeUser;
//               this.busy = state.busy;
//               this.imageSource = state.image
//                 ? state.image.file_url
//                 : this.imageSource;
//               this.displayImage(this.imageSource);
//               break;
//             case "submitprompt":
//             case "updateimage":
//               const updateimageData: PixelmindArcadeMachineState =
//                 message.data as PixelmindArcadeMachineState;
//               this.active = updateimageData.active;
//               this.activeUser = updateimageData.activeUser;
//               this.busy = updateimageData.busy;
//               this.displayImage(updateimageData.image.file_url);
//               //this.scheduleTimeout(10000);
//               break;
//           }
//         } catch (e) {
//           log("error", e);
//         }
//     }
    
//       interact() {
//         if (this.busy) {
//           log(`${this.id} is busy processing request from ${this.activeUser}`);
//           return;
//         }
//         if (this.active && this.activeUser !== userId) {
//           log(`${this.activeUser} is already using ${this.id}`);
//           return;
//         } else if (this.active && this.activeUser === userId) {
//           this.active = false;
//           this.activeUser = NOPUSER;
//         } else {
//           this.active = true;
//           this.activeUser = userId;
//           promptInput.visible = true
//         }
//         const snapshot: PixelmindArcadeMachineState = {
//           id: this.id,
//           active: this.active,
//           activeUser: this.activeUser,
//           busy: this.busy,
//           image: null,
//         };
//         broadcastActive(snapshot);
//         toggleUI(this.id);
//       }
    
//       displayImage(src: string) {
//         this.imageMaterial.albedoTexture = new Texture(src);
//         this.addComponentOrReplace(this.imageMaterial);
//         //this.imageBackSide.addComponentOrReplace(this.imageMaterial);
//       }
    
// }