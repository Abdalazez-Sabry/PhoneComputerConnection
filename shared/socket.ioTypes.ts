import { DefaultEventsMap, EventsMap } from "socket.io/dist/typed-events";

interface SharedEvents {
    "message": (message: string) => void
    "request:phoneClipboard": (ack: (clipboard: string) => void) => void
    "request:computerClipboard": (ack: (clipboard: string) => void) => void
}

export interface ServerToClientEvents extends SharedEvents {
}

export interface ClientToServerEvents extends SharedEvents {
    "message:deviceType": (deviceType: "phone" | "computer") => void;
}