const CHANNEL_NAME = 'heyfocus-settings'

type MessageType = 'opacity' | 'data-updated'

interface BroadcastMessage {
  type: MessageType
  value: number | null
}

export const settingsChannel = new BroadcastChannel(CHANNEL_NAME)

export function broadcastOpacity(value: number) {
  settingsChannel.postMessage({ type: 'opacity', value } as BroadcastMessage)
}

export function broadcastDataUpdate() {
  settingsChannel.postMessage({ type: 'data-updated', value: null } as BroadcastMessage)
}

export function onSettingsMessage(callback: (message: BroadcastMessage) => void) {
  settingsChannel.onmessage = (e: MessageEvent<BroadcastMessage>) => {
    callback(e.data)
  }
}
