import { ExtendedWebSocket } from 'websocket-express';
import { GameEvent } from "~/common/game-event";
import { WebSocket } from 'ws';


export interface GameEventListener {
	onGameChanged(gameEvent: GameEvent): void;
}

export class WebSocketGameEventListener implements GameEventListener {

	ws: ExtendedWebSocket;

	constructor(ws: ExtendedWebSocket) {
		this.ws = ws;
	}

	onGameChanged(gameEvent: GameEvent): void {
		if (this.ws.readyState == WebSocket.OPEN) {
			console.log("Send game event: " + JSON.stringify(gameEvent));
			this.ws.send(JSON.stringify(gameEvent));
		}
	}
	
}
