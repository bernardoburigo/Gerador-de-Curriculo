import React from "react";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <strong>Gerador de Currículo</strong>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="https://github.com/bernardoburigo" target="_blank" rel="noreferrer" className="nav-link" style={{ padding: 8, borderRadius: 8 }}>
            GitHub — Bernardo Búrigo
          </a>
          <a href="https://github.com/BUHW" target="_blank" rel="noreferrer" className="nav-link" style={{ padding: 8, borderRadius: 8 }}>
            GitHub — Victor Antônio Pereira
          </a>
        </div>
      </div>
    </footer>
  );
}
