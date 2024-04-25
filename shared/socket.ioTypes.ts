import { DefaultEventsMap, EventsMap } from "socket.io/dist/typed-events";

interface SharedEvents {
    "message": (message: string) => void
    "request:phoneClipboard": (ack: (clipboard: string) => void) => void
    "request:computerClipboard": (ack: (clipboard: string) => void) => void
    "request:phoneBatteryLevel": (ack: (batteryLevel: number) => void) => void
    "response:phoneBatteryLevel": (batteryLevel: number) => void
}

export interface ServerToClientEvents extends SharedEvents {
}

export interface ClientToServerEvents extends SharedEvents {
    "message:deviceType": (deviceType: "phone" | "computer") => void;
}