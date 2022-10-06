import { getUserData } from "@decentraland/Identity"
import { hud } from "src/builderhud/BuilderHUD"
import * as utils from '@dcl/ecs-scene-utils'
import { movePlayerTo } from "@decentraland/RestrictedActions"
import { Dispenser } from "src/poap/poap"
import { createDanceAreas } from "./createDanceAreas"
//import { PixelMind } from "./arcademachine"
import resources from "./resources"
import * as crypto from "@dcl/crypto-scene-utils"
import { 
    lightshowEnabled, neatEnabled, guidedVideosEnabled, otherVideosEnabled, liveVideoEnabled, 
    countdownEnabled, machinesEnabled, portalsEnabled, buildingEnabled } from './config'

export let player = {
    address: "",
    hasWeb3: false,
    portaled: false,
    vip: false  
}


Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, ()=>{
    log('pos', Camera.instance.position)
})

export let scene = new Entity("scene")
scene.addComponent(new Transform({position: new Vector3(24,0,-8), rotation: Quaternion.Euler(0,180,0), scale: new Vector3(1,1,1)}))
engine.addEntity(scene)
hud.attachToEntity(scene)


export async function pixelmind(){
    

    
    let data = await getUserData()
    if(data?.hasConnectedWeb3){
        let contract= "0xf23e1aa97de9ca4fb76d2fa3fafcf4414b2afed0"
        player.vip= await crypto.nft.checkTokens (contract)
    }
    player.vip = true;
    

    }

    // if (buildingEnabled) {
    // let building = new Entity("building")
    // // building.addComponent(new GLTFShape("models/UpdatedPixelMind5.glb"))
    // building.addComponent(new GLTFShape("models/TP_floor.glb"))
    // const scale = 1;
    // building.addComponent(new Transform({position: new Vector3(0,0,0), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(scale, scale, scale)}))
    // building.setParent(scene)
    // hud.attachToEntity(building)
    // }

    // if (buildingEnabled) {
    //     let island = new Entity("island")
    //     // building.addComponent(new GLTFShape("models/UpdatedPixelMind5.glb"))
    //     island.addComponent(new GLTFShape("models/TP_main.glb"))
    //     const scale = 1;
    //     island.addComponent(new Transform({position: new Vector3(0,0,0), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(scale, scale, scale)}))
    //     island.setParent(scene)
    //     hud.attachToEntity(island)
    //     }




//Constant objects between Channels

//Ground Plane
// const ground = new Entity()
// ground.addComponent(new PlaneShape())
//ground.addComponent(material00)
// ground.addComponent(
//         new Transform({
//             position: new Vector3(8, 0, 8),
//             scale: new Vector3(16, 16, 1),
//             rotation: Quaternion.Euler(90, 90, 0)
//         })
// )
// engine.addEntity(ground)

//orb (trigger signifyer)
const orb = new Entity()
orb.addComponent(new SphereShape())
orb.getComponent(SphereShape).withCollisions = false
//orb.addComponent(material01)
orb.addComponent(new Transform({
    position: new Vector3(8, 4, 8),
    scale: new Vector3(.5, .5, .5)
}))
engine.addEntity(orb)






    let lightshow = new Entity("lightshow")
    if (lightshowEnabled) {
        lightshow.addComponent(new GLTFShape("models/lights.glb"))
        lightshow.addComponent(new Transform({position: new Vector3(-1.76,0.18,-2.2), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(0.9,1,1)}))
        lightshow.setParent(scene)
        hud.attachToEntity(lightshow)
        lightshow.addComponent(new Animator())
        lightshow.getComponent(Animator).addClip(new AnimationState("Animation",{looping: true}))
        lightshow.getComponent(Animator).getClip("Animation").stop()
    }


    // Teles
//     import { movePlayerTo } from '@decentraland/RestrictedActions'
// const respawner = new Entity()
// respawner.addComponent(new BoxShape())
// respawner.addComponent(new Transform({ position: new Vector3(8, 0, 8) }))
// respawner.addComponent(
//   new OnPointerDown(
//     (e) => {
//       movePlayerTo({ x: 15, y: 150, z: 38}, { x: 8, y: 1, z: 8 })
//     },
//     { hoverText: "Move player" }
//   )
// )
// import { movePlayerTo } from '@decentraland/RestrictedActions'
const respawner = new Entity()
respawner.addComponent(new BoxShape())
respawner.addComponent(new Transform({ position: new Vector3(10, 0, 10) }))
respawner.addComponent(
  new OnPointerDown(
    (e) => {
      movePlayerTo({ x: 28, y: 30, z: 45}, { x: 8, y: 1, z: 8 })
    },
    { hoverText: "Move player" }
  )
)

//ADD SOUNDS HERE

    //sounds
    const clip = new AudioClip("sounds/pop.wav")
    const click = new AudioSource(clip)


//Channel  01 Parent
let channel_01 = new Entity()
    channel_01.addComponent(
        new utils.ToggleComponent(utils.ToggleState.On, value => {
            engine.removeEntity(channel_02),
            engine.addEntity(channel_01)
    })
    )

    //Channel Trigger 01
    const trigger_01 = new Entity()
    trigger_01.addComponent(new PlaneShape())
    trigger_01.getComponent(PlaneShape).withCollisions = false
    trigger_01.getComponent(PlaneShape).visible = false
    trigger_01.addComponent(click)
    trigger_01.addComponent(new Transform({
        position: new Vector3(8, 6, 8),
        scale: new Vector3(1, 1, 1),
        rotation: Quaternion.Euler(90, 0, 0)
    }))
    let triggerBox01 = new utils.TriggerBoxShape()
    trigger_01.addComponent(
        new utils.TriggerComponent(
            triggerBox01,
            {
                onCameraExit :() => {
                    log('triggered!')
                    channel_02.getComponent(utils.ToggleComponent).toggle()}
            }))
    click.playing = true

    //Channel 01 Content
    let MainBuilding = new Entity()
    let MainBuildingPath:string = "models/exo_hoe.glb"
        MainBuilding.addComponent(new GLTFShape(MainBuildingPath))
        MainBuilding.addComponent(new Transform({
                position: new Vector3(0, 0, 0),
                scale: new Vector3(3.285, 3.285, 3.285),
                rotation: Quaternion.Euler(0, 180, 0)
    }))

    let exoLogoAnimation = new Entity()
    let exoLogoAnimationPath:string = "models/exologo.glb"
        exoLogoAnimation.addComponent(new GLTFShape(exoLogoAnimationPath))
        exoLogoAnimation.addComponent(new Transform({
                position: new Vector3(3, 0, 2),
                scale: new Vector3(3.1, 3.1, 3.1),
                rotation: Quaternion.Euler(0, 180, 0)
    }))
    // let alecLogo = new Entity()
    // let alecLogoPath:string = "models/Alec_logo.glb"
    //     alecLogo.addComponent(new GLTFShape(alecLogoPath))
    //     alecLogo.addComponent(new Transform({
    //             position: new Vector3(0, 0, 0),
    //             scale: new Vector3(3.285, 3.285, 3.285),
    //             rotation: Quaternion.Euler(0, 180, 0)
    // }))
    // let hpLogo = new Entity()
    // let hpLogoPath:string = "models/hp_logo.glb"
    //     hpLogo.addComponent(new GLTFShape(hpLogoPath))
    //     hpLogo.addComponent(new Transform({
    //             position: new Vector3(0, 0, 0),
    //             scale: new Vector3(3.285, 3.285, 3.285),
    //             rotation: Quaternion.Euler(0, 180, 0)
    // }))
    // let decoLogo = new Entity()
    // let decoLogoPath:string = "models/deco_logo.glb"
    //     decoLogo.addComponent(new GLTFShape(decoLogoPath))
    //     decoLogo.addComponent(new Transform({
    //             position: new Vector3(0, 0, 0),
    //             scale: new Vector3(3.285, 3.285, 3.285),
    //             rotation: Quaternion.Euler(0, 180, 0)
    // }))
    // let pgLogo = new Entity()
    // let pgLogoPath:string = "models/pg_logo.glb"
    //     pgLogo.addComponent(new GLTFShape(pgLogoPath))
    //     pgLogo.addComponent(new Transform({
    //             position: new Vector3(0, 0, 0),
    //             scale: new Vector3(3.285, 3.285, 3.285),
    //             rotation: Quaternion.Euler(0, 180, 0)
    // }))
    let pgLogobanner = new Entity()
    let pgLogobannerPath:string = "models/pg_logo_banner.glb"
        pgLogobanner.addComponent(new GLTFShape(pgLogobannerPath))
        pgLogobanner.addComponent(new Transform({
                position: new Vector3(0, 0, 0),
                scale: new Vector3(3.285, 3.285, 3.285),
                rotation: Quaternion.Euler(0, 180, 0)
    }))
    let testBOT = new Entity()
    let testBOTPath:string = "models/HPtestBOT_path.glb"
        testBOT.addComponent(new GLTFShape(testBOTPath))
        testBOT.addComponent(new Transform({
                position: new Vector3(48, .1, 40),
                scale: new Vector3(.2, .2, .2),
                rotation: Quaternion.Euler(0, 180, 0)
    }))


    //text shapes
    const myEntity1 = new Entity()
    const myText = new TextShape("Hello World!")
    myEntity1.addComponent(myText)
    myText.fontSize = 300
    myText.color = Color3.White()
    myText.font = new Font(Fonts.SansSerif_SemiBold)


// Give entity a shape and transform
// testBOT.addComponent(new Transform())

// //Define the positions of the path
// let path = []
// path[0] = new Vector3(1, 1, 1)
// path[1] = new Vector3(1, 1, 15)
// path[2] = new Vector3(15, 1, 15)
// path[3] = new Vector3(15, 1, 1)


// // Move entity
// testBOT.addComponent(new utils.FollowPathComponent(path, 8))

// // Add entity to engine
// engine.addEntity(testBOT)

//Set parent
trigger_01.setParent(channel_01)
MainBuilding.setParent(channel_01)
exoLogoAnimation.setParent(channel_01)
// alecLogo.setParent(channel_01)
// hpLogo.setParent(channel_01)
// decoLogo.setParent(channel_01)
// pgLogo.setParent(channel_01)
testBOT.setParent(channel_01)


// //Trigger animations
// //define camera
// const camera = Camera.instance
// //define distance
// function distance(pos1: Vector3, pos2: Vector3): number {
//     const a = pos1.x - pos2.x
//     const b = pos1.z - pos2.z
//     return a * a + b * b
//   }

//   //implements ISystem
//   export class UpdateSystem  implements ISystem{
//     update() {
//         const transform = pgLogo.getComponent(Transform)
//         const dist = distance(transform.position, camera.position)
//         if (dist < .1) {
//             engine.removeEntity(pgLogo)
//         } 
//         else {
//             let pgLogoBanner = new Entity()
//             let pgLogoBannerPath:string = "models/pg_logo.glb"
//                 pgLogoBanner.addComponent(new GLTFShape(pgLogoBannerPath))
//                 pgLogoBanner.addComponent(new Transform({
//                         position: new Vector3(0, 0, 0),
//                         scale: new Vector3(3.285, 3.285, 3.285),
//                         rotation: Quaternion.Euler(0, 180, 0)
//             }))
//         }
//     }
// }

// engine.addSystem(new UpdateSystem, 1)


//specify start state to run when the scene begins
engine.addEntity(channel_01)

    //    if (buildingEnabled) {
   //        let terst = new Entity("building2")
    //        terst.addComponent(new GLTFShape("models/building2.glb"))
    //        const scale = 1;
    //        terst.addComponent(new Transform({position: new Vector3(0,0,0), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(scale, scale, scale)}))
    //        terst.setParent(scene)
    //        hud.attachToEntity(terst)
    //        }

//Channel 02 - Parent
let channel_02 = new Entity()
    channel_02.addComponent(
        new utils.ToggleComponent(utils.ToggleState.On, value => {
            engine.removeEntity(channel_01),
            engine.addEntity(channel_02)
    })
    )

    //Channel Trigger 02
    const trigger_02 = new Entity()
    trigger_02.addComponent(new PlaneShape())
    trigger_02.getComponent(PlaneShape).withCollisions = false
    trigger_02.getComponent(PlaneShape).visible = false
    trigger_02.addComponent(click)
    trigger_02.addComponent(new Transform({
        position: new Vector3(8, 6, 8),
        scale: new Vector3(1, 1, 1),
        rotation: Quaternion.Euler(90, 0, 0)
    }))
    let triggerBox02 = new utils.TriggerBoxShape()
    trigger_02.addComponent(
        new utils.TriggerComponent(
            triggerBox02,
            {
                onCameraExit :() => {
                    log('triggered!')
                    channel_01.getComponent(utils.ToggleComponent).toggle()}
            }))
    click.playing = true

    //angies
    let variable = new Entity()
    let variablePath:string = "models/angies.glb"
            variable.addComponent(new GLTFShape(variablePath))
            variable.addComponent(new Transform({
                position: new Vector3(24, 0, -6),
                scale: new Vector3(1, 1, 1),
                rotation: Quaternion.Euler(0, 180, 0)
            }))
engine.addEntity(respawner)

    //lights show
    let lif = new Entity()
    let lifPath:string = "models/lights.glb"
            lif.addComponent(new GLTFShape(lifPath))
            lif.addComponent(new Transform({
                position: new Vector3(23, 0, -7),
                scale: new Vector3(1, 1, 1),
                rotation: Quaternion.Euler(0, 180, 0)   
            }))
engine.addEntity(respawner)

// //effect cube
// let vectorList = new Entity()

// engine.addEntity(vectorList)

// const effectCube = new Entity()
// effectCube.addComponent(new SphereShape())
// effectCube.getComponent(SphereShape).withCollisions = false
// //effectCube.addComponent(material01)
// effectCube.addComponent(new Transform({
//     position: new Vector3(8, 4, 8),
//     scale: new Vector3(.5, .5, .5)
// }))
// engine.addEntity(effectCube)


// effectCube.addComponent(
//     new utils.FollowPathComponent(vectorList, 10, () => this.repeatMovement(effectCube, positionX, positionY, positionZ))
// )
// engine.addEntity(effectCube)

// repeatMovement(effectCube: Entity, positionX: number, positionY: number, positionZ: number) {
//     effectCube.removeComponent(utils.FollowPathComponent)

//     let randomNum = Math.random()

//     if (randomNum > .25) {
//         let thisMaterial = effectCube.getComponent(Material)

//         if (randomNum> .9) {
//             thisMaterial.emissiveColor = Color3.Blue()
//         }

//         else if (randomNum > .7) {
//             thisMaterial.emissiveColor = Color3.Random()
//         }
//         else if (randomNum > .5) {
//             thisMaterial.emissiveColor = Color3.Yellow()
//         }
//         else if (randomNum > .3) {
//             thisMaterial.emissiveColor = Color3.Purple()
//         }
//         effectCube.removeComponent(utils.KeepRotatingComponent)

//         effectCube.addComponent(
//             new utils.KeepRotatingComponent(Quaternion.Euler(Math.random() * 180, Math.random() * 180, Math.random() * 180))
//         )
//     }
// }

//Set parent
trigger_02.setParent(channel_02)
variable.setParent(channel_02)
lif.setParent(channel_02)

    import { clicked, neat } from "../neat/neat";
    if (neatEnabled) {
        neat.init(
            true, //display locally for admin
            true, //hide avatars around the neat
            4, //distance to click neat
            {position: new Vector3(-16.4,2,-6.51), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(1,1,1)}, //neat position in scene
            hud //if you have the builder hud, pass hud, if not, pass null
            )
            neat.setParent(scene)
    }



    // let softsound2 = new Entity("soft sound2")
    // softsound2.addComponent(new Transform({position: new Vector3(-14,91,-35), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(32,3,43)}))
    // softsound2.setParent(scene)
    // softsound2.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(40,30,86), new Vector3(0,5,0)),{
    //     enableDebug: true,
    //     onCameraEnter:()=>{
    //         log('soften')
    //         guidedvideo1.volume = .1
    //         guidedvideo2.volume = .1
    //         guidedvideo3.volume = .1
    //     },
    //     onCameraExit:()=>{
    //         log('strengthen')
    //         guidedvideo1.volume = 1
    //         guidedvideo2.volume = 1
    //         guidedvideo3.volume = 1
    //     }
    // }))
    // hud.attachToEntity(softsound2)


    // let salon1 = new Entity("salon1")
    // salon1.addComponent(new BoxShape())
    // salon1.addComponent(new Transform({position: new Vector3(-16.6,25.6,-65.9), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(2,2,2)}))
    // salon1.setParent(scene)
    // salon1.addComponent(new OnPointerDown(()=>{
    //     openExternalURL("https://www.instagram.com/femdemic_creations/")
    // }, {showFeedback: true, hoverText: "Femdemic Creations"}))
    // salon1.addComponent(basic)
    // hud.attachToEntity(salon1)


    // let salon2 = new Entity("salon2")
    // salon2.addComponent(new BoxShape())
    // salon2.addComponent(new Transform({position: new Vector3(-24.6,25.6,-87.9), rotation: Quaternion.Euler(0,0,0), scale: new Vector3(2,2,2)}))
    // salon2.setParent(scene)
    // salon2.addComponent(new OnPointerDown(()=>{
    //     openExternalURL("https://www.instagram.com/lina_condes/")
    // }, {showFeedback: true, hoverText: "Lina Condes"}))
    // salon2.addComponent(basic)
    // hud.attachToEntity(salon2)





