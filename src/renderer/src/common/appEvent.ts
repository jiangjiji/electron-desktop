import { EventEmitter } from 'events'

type EventMap = {
  'desktop-background-refresh': []
}

export const appEvent = new EventEmitter<EventMap>()
