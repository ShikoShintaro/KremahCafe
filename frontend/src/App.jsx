import { useEffect } from "react";
import "./legacy.css";
import KremahAdmin from "./pages/KremahAdmin";

export default function App() {
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;

  const isLocalHost = ["localhost", "127.0.0.1"].includes(hostname);

  const isAdminPortal =
    pathname.startsWith("/management-portal") ||
    pathname.startsWith("/admin-recovery");

  useEffect(() => {
    document.body.classList.toggle(
      "admin-portal-mode",
      isAdminPortal
    );

    return () => {
      document.body.classList.remove("admin-portal-mode");
    };
  }, [isAdminPortal]);

  if (!isAdminPortal) {
    return null;
  }

  if (!import.meta.env.DEV || !isLocalHost) {
    return (
      <main style={{ padding: "48px 24px", textAlign: "center" }}>
        <h1>Admin portal unavailable</h1>
        <p>The management portal is only available locally.</p>
        <a href="/">Return to KremahCafe</a>
      </main>
    );
  }

  return <KremahAdmin />;
}