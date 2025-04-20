import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";
import crocCss from "~/croc.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: crocCss }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="container">
          <Link to={"/"}>
            <img src="/krok1.gif" alt="Remix" className="croc"/>
          </Link>

          <div style={{ position: "relative" }}>
          {children}

          {navigation.state !== "idle" && (
            <div
              style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#000",
                textShadow: "0 0 2px rgba(255, 255, 255, 0.8)",
                zIndex: 9999,
                pointerEvents: "auto",
                animation: "fadeIn 1s ease-in-out forwards, bounce 1s ease-in-out infinite"
              }}
            >
              Creating game...
            </div>
          )}
        </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
