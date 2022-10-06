import { Delay, KeepRotatingComponent } from "@dcl/ecs-scene-utils"
import * as UI from "@dcl/ui-scene-utils"
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { getUserData } from "@decentraland/Identity"
import { hud } from "src/builderhud/BuilderHUD"

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

export let code = ""

export function getCode(){

  let code = ""
  for(var i = 0; i < 4; i++){
    code += chars[Math.floor(Math.random() * ((chars.length-1) - 0 + 1) + 0)]
  }
  return code
}

export class Dispenser extends Entity {
  idleAnim = new AnimationState("Idle_POAP", { looping: true })
  buyAnim = new AnimationState("Action_POAP", { looping: false })
  buttonAnim = new AnimationState("Button_Action", { looping: false })
  eventName: string
  clickable: boolean = true
  timeToClickable: number = 0
  poapServer = ""

  bot: UI.CustomPrompt
  text:UI.CustomPromptTextBox

  constructor(transform: TranformConstructorArgs, poapServer: string, eventName: string) {
    super("poapbooth")
    engine.addEntity(this)

    this.addComponent(new GLTFShape("src/poap/poap_dispenser.glb"))
    this.addComponent(new Transform(transform))


    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(this.idleAnim)
    this.getComponent(Animator).addClip(this.buyAnim)
    this.idleAnim.play()

    this.eventName = eventName

    this.poapImage(this)



    this.bot = new UI.CustomPrompt(UI.PromptStyles.DARK, undefined, undefined, true)
    this.bot.addText("POAP Bot Preventer", 0, 150, Color4.White(), 25)
    this.bot.addText("CODE: x437", 0, 75, Color4.White(), 20)
    this.text = this.bot.addTextBox(0, 0, "type the above passcode", (e)=>{
    codeCheck = this.text.currentText
   })
   this.bot.addButton("Claim POAP", 0, -100, ()=>{
    this.bot.hide()
    this.checkCode()
   }, UI.ButtonStyles.RED)

  
    let button = new Entity("poapbutton")
    button.addComponent(new GLTFShape("src/poap/poap_button.glb"))
    button.addComponent(new Animator())
    button.getComponent(Animator).addClip(this.buttonAnim)
    button.setParent(this)
    button.addComponent(
      new OnPointerDown(
        (e) => {


         if (!this.clickable) {
          UI.displayAnnouncement("POAP Already Collected", 5)
          return
        }
        this.clickable = false      

          code = getCode()
          const firstElement = this.bot.elements[1]
          if (firstElement instanceof UI.CustomPromptText) {
            firstElement.text.value = code
          }

          this.bot.show()
  
        },
        { hoverText: "Claim POAP token", showFeedback:true }
      )
    )
    engine.addEntity(button)
    //hud.attachToEntity(button)
  }

  async poapImage(parent:Entity){
    var poapImage = new Entity()
    poapImage.addComponent(new PlaneShape())
    poapImage.addComponent(new Material())

    log('event name', this.eventName)
    var image_url = await getPOAPImage(this.eventName)
    poapImage.getComponent(Material).albedoTexture = new Texture(image_url)
    poapImage.getComponent(Material).alphaTexture = new Texture("src/poap/circle_mask.png")
    poapImage.addComponent(new Transform({
      position: new Vector3(0,1.75,0),
      rotation: Quaternion.Euler(0,180,0),
      scale: new Vector3(.6,.6,.6)
    }))
    poapImage.setParent(parent)
    poapImage.addComponent(new KeepRotatingComponent(Quaternion.Euler(0,45,0)))
  }

  public activate(): void {
    let anim = this.getComponent(Animator)

    anim.getClip("Idle_POAP").stop()
    anim.getClip("Action_POAP").stop()

    anim.getClip("Action_POAP").play()

    this.addComponentOrReplace(
      new Delay(4000, () => {
        anim.getClip("Action_POAP").stop()

        anim.getClip("Idle_POAP").play()
      })
    )
  }



  checkCode(){
    if(codeCheck == code){
      this.makeTransaction('poapapi.dcl.guru', this.eventName)
    }
    else{
      log('code incorrect')
      UI.displayAnnouncement("Incorrect code")
      this.clickable = true
    }
  }

  async handlePoap(eventName: string) {
    log(eventName)
    const userData = await getUserData()
    if (!userData || !userData.hasConnectedWeb3 || !userData.publicKey) {
      log("no wallet")
      return
    }
    const url = 'https://lkdcl.co/dcl/smartitems/sendpoap'
  
    let body = JSON.stringify({
      address: userData.publicKey.toLowerCase(),
      event: eventName,
      item: 'POAP',
      //server: playerRealm.serverName,
      //realm: playerRealm.layer,
    })
  
    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      })
      let data = await response.json()
      log('Poap status: ', data)
  
      if (data.success === true) {
        if (data.dead) {
          UI.displayAnnouncement('This event is no longer valid.', 5)
        } else if (data.already) {
          UI.displayAnnouncement(
            'You already claimed a\nPOAP token for this event!',
            5
          )
        } else {
          UI.displayAnnouncement(
            "POAP was sent to your address!\nhttps/\/\:app.poap.xyz",
            5
          )
        }
      } else {
        UI.displayAnnouncement(data.error, 5)
      }
    } catch {
      log('error fetching from token server ', url)
    }
  }

  async makeTransaction(poapServer: string, event: string) {
    const userData = await getUserData()
    if (!userData || !userData.hasConnectedWeb3) {
      log('no wallet')
      //poapActive = false
      return
    }
    
    const realm = await getCurrentRealm()

    const url = `https://${poapServer}/claim/${event}`
    let method = 'POST'
    let headers = { 'Content-Type': 'application/json' }
    let body = JSON.stringify({
      address: userData.publicKey,
      catalyst: realm ? realm.domain : '',
      room: realm ? realm.layer : '',
    })

    try {
      let response = await fetch(url, {
        headers: headers,
        method: method,
        body: body,
      })
      let data = await response.json()
      if (response.status == 200) {
        UI.displayAnnouncement('A POAP token is being sent to your wallet', 3)
        // if (inscene) {
        //   engine.addSystem(humantrigger)
        // }
        //poapActive = false
      } else {
        UI.displayAnnouncement(`Oops, there was an error: "${data.error}"`, 3)
       // poapActive = false
      }
    } catch {
      log('error fetching from POAP server ', url)
      //poapActive = false
    }
    
    return
  }
}

export async function getPOAPImage(eventName:string) {
  
  //const url = server + 'getpoapimage'
  
  const url = 'https://api.poap.xyz/events'
  try {
    var image:any
    let response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    let json = await response.json()
    for(var i = 0; i < json.length; i++){
      if(json[i].id == eventName){
        image = json[i].image_url
        break;
      }
    }
    if(image){
      return image
    }
    else{
      log('failure')
      return ""
    }
  
  } catch {
   log('error fetching from POAP server', url)
  }
  
  let body = JSON.stringify({
    id: eventName
  })
  
  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    })
    let data = await response.json()
    log('Poap status: ', data)
  
    return data.image
  } catch {
    log('error fetching from token server ', url)
  }
  }

let codeCheck = ""

