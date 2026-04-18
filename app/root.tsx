import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles/globals.css";

export const links: Route.LinksFunction = () => [
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "予期しないエラーが発生しました";
  let details = "時間を置いて再度お試しください。";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
    details = error.data ?? details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="text-muted-foreground">{details}</p>
    </main>
  );
}
