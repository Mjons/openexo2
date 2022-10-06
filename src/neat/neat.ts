import { imageTexture, neatBG, neatCode, inputcode, neatText, neatInput } from './ui'
import { CHECK_VALID, CLEAR_UI, NeatSystem, TimerSystem } from './system'
import { getUserData } from '@decentraland/Identity'
import { getParcel } from '@decentraland/ParcelIdentity'
import { signedFetch } from '@decentraland/SignedFetch'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'

/*
Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, (e)=>{
    neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
Input.instance.subscribe("BUTTON_DOWN", ActionButton.WALK, false, (e)=>{
  neat.advanced ? isCorrect(e) : null
})
*/

export function isCorrect(e:any){
    log("pressed ", e)
    if(e.button != button){
        incorrect = true
        showMessage("Incorrect Button", 4, CLEAR_UI, null)
        engine.removeEntity(neat)
        pressedSystem.stop()
    }
    else{
        if(!incorrect && pressEnabled){
            neatCode.value = getCode()        
            neatBG.visible = true
        }
    }

}

export class Pressed{
    update(){
        log("enabling press")
        pressEnabled = true
    }
    stop(){
        log('disabled press')
        pressEnabled = false
        engine.removeSystem(this)
    }
}
export let pressedSystem = new Pressed()

export type Props = {
  id?: string
}

let chars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]

export let incorrect = false
export let correct = false
export let pressEnabled = false
export let button:any
export let buttons = [
    ActionButton.ACTION_3,
    ActionButton.ACTION_4,
    ActionButton.ACTION_5,
    ActionButton.ACTION_6,
    ActionButton.PRIMARY,
    ActionButton.SECONDARY,
    ActionButton.WALK
]

export let buttonMapping:any = {
    [ActionButton.ACTION_3]: "1",
    [ActionButton.ACTION_4]: "2",
    [ActionButton.ACTION_5]: "3",
    [ActionButton.ACTION_6]: "4",
    [ActionButton.PRIMARY]: "E",
    [ActionButton.SECONDARY]: "F",
    [ActionButton.WALK]: "SHIFT",
}

export let code = ""
export let clicked = false
export let starTime = 0
export let endTime = 0
export let verified = false

export function getCode(){

  let code = ""
  for(var i = 0; i < 4; i++){
    code += chars[Math.floor(Math.random() * ((chars.length-1) - 0 + 1) + 0)]
  }
  return code
}

export function verify(){
    verified = true
}

export class Neat extends Entity{
    props:any
    neatImage: Entity
    neat:Entity
    test:any
    action:any
    hideAvatar: any
    advanced = false
    clicked = false
    id: any

    constructor(){
        super('neat')
        engine.addEntity(this)

        this.neat = new Entity(this.name + '-badge-')
        this.neat.addComponent(new Transform())
        this.neat.addComponent(new GLTFShape("src/neat/models/neat.glb"))

      this.randomize()

      this.neatImage = new Entity()
      this.neatImage.addComponent(new PlaneShape())
      this.neatImage.addComponent(new Material())
      this.neatImage.addComponent(new Transform({
        position: new Vector3(-0.02,.76,0),
        rotation: Quaternion.Euler(0,90,180),
        scale: new Vector3(.6,.6,.6)
      }))
      this.neatImage.setParent(this.neat)

    }

    async init(testMode:boolean, hideAvatar:boolean, distance:number, transform: TranformConstructorArgs, hud?:any){
      //this.props = props
      this.test = testMode
      this.hideAvatar = hideAvatar
      //this.advanced = advanced
      this.addComponentOrReplace(new Transform(transform))

      const confirm = new UIImage(neatBG, imageTexture)
      confirm.sourceLeft = 0
      confirm.sourceTop = 0
      confirm.sourceWidth = 179
      confirm.sourceHeight = 66
      confirm.height = 33
      confirm.width = 90
      confirm.hAlign = "center"
      confirm.vAlign = "center"
      confirm.positionY = -30
      confirm.onClick = new OnClick(()=>{
          checkCode(this.id, neatCode.value, this)
      })

      await this.create()
      if(hud){
        log('hud is true')
        hud.attachToEntity(this)
      }
  }

    getMapping(){
        return buttonMapping[button]
    }

    randomize(){
        let rand = Math.floor(Math.random() * (buttons.length - 1 - 0 + 1) + 0);
        button = buttons[rand]
        log('corrct button is ', button)
    }

    enablePress(enabled: boolean){
        pressEnabled = enabled
    }

    async create(){

        if(await isPreviewMode() && this.test){
            this.neat.setParent(this)
        }
        else{
            engine.addSystem(new TimerSystem(this.neat, this))
        }
        
        engine.addSystem(new RotationSystem(this.neat))

        let data = await getData()
        if(data != ""){
          starTime = data.start
          endTime = data.end
          this.id = data.id
  
          engine.addSystem(new NeatSystem(5, CHECK_VALID,this, true))
          
          let text = new Texture(data.image)
          this.neatImage.getComponent(Material).albedoTexture = text
          this.neatImage.getComponent(Material).emissiveTexture = text
          this.neatImage.getComponent(Material).alphaTexture = new Texture("src/neat/textures/circle_mask.png")
          this.neatImage.getComponent(Material).emissiveIntensity = 1.5
          this.neatImage.getComponent(Material).emissiveColor = Color3.White()
        }
        else{
          log('data is false')
          engine.removeEntity(this)
        }

        if(this.hideAvatar){
          this.neat.addComponent(
            new AvatarModifierArea({
              area: { box: new Vector3(6, 4, 6) },
              modifiers: [AvatarModifiers.HIDE_AVATARS],
            })
          )
        }

        if(this.advanced){
          this.neatImage.addComponent(new OnPointerUp(()=>{
            pressedSystem.stop()
        }))
    
        this.neatImage.addComponent(new OnPointerDown(()=>{
            engine.addSystem(pressedSystem)
            showMessage("Hold Click and Press " + buttonMapping[button], 5, CLEAR_UI, null)
        }, {distance: 1, showFeedback:true, hoverText: "Hold Click and Press " + buttonMapping[button]}))
    
        this.neat.addComponent(new OnPointerUp(()=>{
            pressedSystem.stop()
        }))
    
        this.neat.addComponent(new OnPointerDown(()=>{
            engine.addSystem(pressedSystem)
            showMessage("Hold Click and Press " + buttonMapping[button], 5, CLEAR_UI, null)
        }, {distance: 1, showFeedback:true, hoverText: "Hold Click and Press " + buttonMapping[button]}))
      }
      else{
        this.neatImage.addComponent(new OnPointerDown(()=>{
          if(!clicked){
            clicked = true
            neatCode.value = getCode()        
            neatBG.visible = true
          }
        }, {distance: 1, showFeedback:true, hoverText: "Click for NEAT"}))
    
        this.neat.addComponent(new OnPointerDown(()=>{
          if(!clicked){
            clicked = true
            neatCode.value = getCode()        
            neatBG.visible = true
          }
        }, {distance: 1, showFeedback:true, hoverText: "Click for NEAT"}))
      }

    }
}

export let neat = new Neat()

export class RotationSystem{
    image:Entity
  
    constructor(image:Entity){
      this.image = image 
    }
    update(){
      let rot = this.image.getComponent(Transform).rotation.eulerAngles.clone()
      this.image.getComponent(Transform).rotation = Quaternion.Euler(rot.x, rot.y + 1.5, rot.z)
    }
  }
  

  export let claimlink = "https://lkdcl.co/neat"

  export function checkCode(id:string, ecode:string, neat:Neat){
      log('neat input', inputcode)
      log('ecode', ecode)
      if(inputcode == ecode){
        log('we are correct input')
        claimNeat(id, neat)
        neatBG.visible = false
      }
      else{
        log('code incorrect')
        neatBG.visible = false
        showMessage('Incorrect Code', 5, CLEAR_UI, null)
        neatInput.value = ""
      }
    }
  
    export function showMessage(
      message: string,
      time: number,
      action: string,
      entity: any
    ) {
      neatText.visible = true
      neatText.value = message
      engine.addSystem(new NeatSystem(time, action, entity, false))
    }
  
    export async function getData(){
      let userData = await getUserData()
      if(userData?.hasConnectedWeb3){
        log('attempting to get image')

        const parcel = await getParcel()
        log('base parcel: ', parcel.land.sceneJsonData.scene.base)
        let base = parcel.land.sceneJsonData.scene.base
        let temp = base.split(',')      

        try{
          let response = await fetch(claimlink + "/getneat?x=" + temp[0] + "&y=" + temp[1])
          let j = await response.json()
          log('getting neat data', j)
          if(j.valid){
            if(j.data.start){
              return j.data 
            }
            else{
              return ""
            }

          }
        }
        catch(e){
          log('error =>', error)
        }
    
        /*
        try{
          let response = await fetch(claimlink + "/getneatinfo?id=" + id)
          let json = await response.json()
          if (json && json.valid) {
            log("we have valid request", json)
            return json
          }
          else{
            log('invalid request =>', json.reason)
            return ""
          }
        }
        catch(errr){
          log('error =>', error)
        return ""
        }
        */
  
      }
      else{
        return ""
      }
    }
  
  
    export async function claimNeat(id:string, neat:Entity){
      let userData = await getUserData()
      if(userData?.hasConnectedWeb3){
        log('attempting to claim')
    
        try{
          const parcel = await getParcel()
  
          let baseParcel = parcel.land.sceneJsonData.scene.base
          let response = await signedFetch(claimlink + "/dcl/claim?id=" + id + "&base=" + baseParcel)
          let json
          if (response.text) {
            json = await JSON.parse(response.text)
            log(json)
          }
      
          if (json && json.valid) {
            log("we have valid request")
            if(json.claim){
              log('we claimed')
              showMessage("NEAT Claimed!", 5, CLEAR_UI, null)
            //  ui.displayAnnouncement("NEAT claimed!")
            }
          }
          else{
            log('invalid request =>', json.reason)
            showMessage("Error: " + json.reason, 5, CLEAR_UI, null)
            //ui.displayAnnouncement("Error: " + json.reason)
          }
          engine.removeEntity(neat)
        }
        catch(errr){
          log('error =>', error)
          showMessage("Error: " + errr, 5, CLEAR_UI, null)
        }
  
      }
      else{
        showMessage("Error: WEB3 not enabled", 5, CLEAR_UI, null)
      }
    }