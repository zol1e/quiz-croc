import { createCookieSessionStorage } from "@remix-run/node";


type SessionData = {
    create: boolean;
    playerId: string;
    gameId: string;
    topic: string;
    exampleQuestion: string;
    errors: Record<string, string>;
};
type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "__session",
        secrets: ["s3cret1"]
      },
    }
  );

export { getSession, commitSession, destroySession };
