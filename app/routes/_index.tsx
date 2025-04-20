import {Form, redirect, useActionData} from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { getSession, commitSession } from "~/sessions";
import { useState } from "react";
import { Games } from "~/.server/games";


export const meta: MetaFunction = () => {
  return [
    { title: "Quizcroc" },
    { name: "Quizcroc", content: "Quizcroc" },
  ];
};


export async function action({ request, }: ActionFunctionArgs) {
    const session = await getSession(
      request.headers.get("Cookie")
    );
    const body = await request.formData();

    session.unset("gameId");
    session.unset("create");
    session.unset("playerId");
    session.unset("topic");

    const errors = {};

    const formAction = body.get("formAction");
    session.set("create", (formAction === "create") ? true : false);

    const playerId = body.get("playerId") as string;
    if (!playerId) errors.playerId = "required";
    session.set("playerId", playerId);

    if (formAction === "create") {
      
      const topic = body.get("topic") as string;
      if (!topic) errors.topic = "required";
      session.set("topic", topic);

    } else if (formAction === "join") {

      const gameId = body.get("gameId") as string;
      if (!gameId) errors.gameId = "required";
      else
      if (!Games.get().hasGame(gameId)) errors.gameId = "Game not found!"
      session.set("gameId", gameId);

    } else {
      throw new Error("Unknown formAction value: " + formAction);
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    return redirect("/game", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
}


export default function Index() {
  const actionData = useActionData<typeof action>();
  const [playerId, setPlayerId] = useState("");
  const [topic, setTopic] = useState("");
  const [gameId, setGameId] = useState("");

  return (
    <>
    <Form method="post">
      <div>Nickname {actionData?.errors?.playerId ? " - " + actionData?.errors?.playerId : ""}
      <input name="playerId" type="text" autoCorrect="off" autoCapitalize="off"
      value={playerId}
      onChange={(e) => {
        setPlayerId(e.target.value);
        if (actionData?.errors) actionData.errors.playerId = null;
      }}
      style={{
        border: (actionData?.errors?.playerId && !playerId) ? '1px solid red' : '1px solid #ccc',
        borderRadius: "4px",
      }}
      />
      </div>

      <div>Quiz topic {actionData?.errors?.topic ? " - " + actionData?.errors?.topic : ""}
      <input name="topic" type="text" autoCorrect="off" autoCapitalize="off" 
      placeholder="Friends series, quantum physics etc."

      value={topic}
      onChange={(e) => {
        setTopic(e.target.value);
        if (actionData?.errors) actionData.errors.topic = null;
      }}
      style={{
        border: (actionData?.errors?.topic && !topic) ? '1px solid red' : '1px solid #ccc',
        borderRadius: "4px",
      }}
      />
      </div>

      <button className="button" type="submit" name="formAction" value="create">Create game</button>

      <div>Game ID {actionData?.errors?.gameId ? " - " + actionData?.errors?.gameId : ""}
      <input name="gameId" type="text" autoCorrect="off" autoCapitalize="off"
      value={gameId}
      onChange={(e) => {
        setGameId(e.target.value);
        if (actionData?.errors) actionData.errors.gameId = null;
      }}
      style={{
        border: (actionData?.errors?.gameId && !gameId) ? '1px solid red' : '1px solid #ccc',
        borderRadius: "4px",
      }}
      />
      </div>

      <button className="button" type="submit" name="formAction" value="join">Join</button>
    </Form>
    </>
  );
}
