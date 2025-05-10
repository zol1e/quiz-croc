import { describe, expect, test } from "vitest";
import { GameWebSocketEndpoint } from "./game-ws";


describe('WebSocket tests', () => {
    test('Get wsKey from WebSocket connection', () => {
      const headers = ["1", "valami1", "Sec-WebSocket-Key", "12345"];
      const wsKey = GameWebSocketEndpoint.getWsKey(headers);
      expect(wsKey).toBe("12345");
    });
});
