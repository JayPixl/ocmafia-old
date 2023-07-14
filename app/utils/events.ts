import { EventEmitter } from 'node:events'

export const emitter = new EventEmitter()

export const EVENTS = {
    MESSAGE_UPDATE: (roomId: string) => {
        console.log(`Emitting to /chat/room/${roomId}`)
        emitter.emit(`/chat/room/${roomId}`)
    },
    TEST_UPDATE: () => {
        console.log("Sending test update")
        emitter.emit('update')
    }
}