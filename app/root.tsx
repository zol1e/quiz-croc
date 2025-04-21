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
            <div className="fullscreen-loading">
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
