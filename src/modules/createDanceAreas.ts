import * as utils from '@dcl/ecs-scene-utils'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { triggerEmote, PredefinedEmote } from '@decentraland/RestrictedActions'
import { hud } from 'src/builderhud/BuilderHUD'
import { danceEmotesEnabled } from './config'

export let danceAreas: any = [
  {
    transform: {position: new Vector3(-18,-0.001,-34), rotation: Quaternion.Euler(90,0,0), scale: new Vector3(41,37,5)},
    type: 'all'
  }
]

export function createDanceAreas(parent: Entity) {
  for (let i in danceAreas) {
    let area = new Entity('dance-' + i)
    area.addComponent(new Transform(danceAreas[i].transform))

      executeTask(async () => {
        if (await isPreviewMode()) {
           area.addComponent(new PlaneShape())
        }
      })

    area.setParent(parent)
    hud.attachToEntity(area)

    let dsystem = new DanceSystem(danceAreas[i].type)

    area.addComponent(
      new utils.TriggerComponent(
        new utils.TriggerBoxShape(
          new Vector3(
            area.getComponent(Transform).scale.x,
            area.getComponent(Transform).scale.y,
            area.getComponent(Transform).scale.z
          ),
          new Vector3(0, 2.5, 0)
        ),
        {
          enableDebug: false,
          onCameraEnter: () => {
            engine.addSystem(dsystem)
          },
          onCameraExit: () => {
            engine.removeSystem(dsystem)
          },
        }
      )
    )
  }
}

export class DanceSystem {
  length = 11
  timer = 2
  routine:any

  routines: PredefinedEmote[] = [
    PredefinedEmote.ROBOT,
    PredefinedEmote.TIK,
    PredefinedEmote.TEKTONIK,
    PredefinedEmote.HAMMER,
    PredefinedEmote.HEAD_EXPLODDE,
    PredefinedEmote.HANDS_AIR,
    PredefinedEmote.DISCO,
    PredefinedEmote.DAB,
  ]

  constructor(routine: PredefinedEmote) {
    this.routine = routine
  }

  update(dt: number) {
    //log(dt)

    if (danceEmotesEnabled) {
      if (this.timer > 0) {
        this.timer -= dt
      } else {
        this.timer = this.length
        if (this.routine == 'all') {
          let rand = Math.floor(Math.random() * (this.routine.length - 0) + 0)
          triggerEmote({ predefined: this.routines[rand] })
        } else {
          triggerEmote({ predefined: this.routine })
        }
      }
    }
  }
}