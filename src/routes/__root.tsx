import { Outlet, createRootRoute, HeadContent, Scripts, Navigate } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { buildGtmHeadScript } from "@/lib/gtm";
import { SignupOriginTracker } from "@/components/SignupOriginTracker";

const gtmId = import.meta.env.VITE_GTM_ID?.trim() || undefined;
const gtmHeadScript = gtmId ? buildGtmHeadScript(gtmId) : null;

function NotFoundComponent() {
  return <Navigate to="/" />;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "E-book Pje-Calc 2026 — Prof. Vicelmo Alencar" },
      {
        name: "description",
        content:
          "Domine o Pje-Calc e a Lei 14.905/2024. Guia prático e definitivo para liquidar sentenças com precisão na Justiça do Trabalho.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <SignupOriginTracker />
      <Outlet />
    </>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {gtmId && gtmHeadScript ? <script dangerouslySetInnerHTML={{ __html: gtmHeadScript }} /> : null}
        <HeadContent />
      </head>
      <body>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        {children}
        <Scripts />
      </body>
    </html>
  );
}
