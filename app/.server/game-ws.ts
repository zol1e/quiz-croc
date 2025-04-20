import { GameMessageHandler } from './game-message-handler';
import { GameMessage } from '../common/model';
import { WebSocketGameEventListener } from './game-event-listener';
import { Router } from 'websocket-express';


export class GameWebSocketEndpoint {

    router: Router;
    wsHandlersByWsKey: { [key: string]: WebSocketGameEventListener; } = {};

    constructor(router: Router) {
        this.router = router;
        this.initWebsocketEndpoint(this.router);
    }

    initWebsocketEndpoint(router: Router): void {
      router.ws('/game-ws', async (req, res) => {
        const ws = await res.accept();
        
        const wsKey = GameWebSocketEndpoint.getWsKey(req.rawHeaders);
        if (wsKey == null) {
          ws.close(1002, "Sec-WebSocket-Key is not found in the header");
          return;
        }
        this.wsHandlersByWsKey[wsKey] = new WebSocketGameEventListener(ws);
        console.log("hi " + wsKey);

        ws.addEventListener('message', (msg: MessageEvent) => {
          console.log(`msg ${msg.data}`);
          const gameMessage: GameMessage = JSON.parse(msg.data);
          GameMessageHandler.handle(gameMessage, this.wsHandlersByWsKey[wsKey]);
        });
      
        ws.addEventListener('close', (msg: CloseEvent) => {
          console.log(`close2 ${msg.reason}`);
          delete this.wsHandlersByWsKey[wsKey];
        });
      });
    }

    public static getWsKey(headers: string[]): string | null {
      for (let i = 0; i < headers.length ; i++) {
        if (headers[i] === "Sec-WebSocket-Key") {
          return headers[i + 1];
        }
      }
      return null;
    }
}
