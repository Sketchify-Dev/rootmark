import { ImageResponse } from "next/og";

export const alt = "Rootmark — verifiable index for the Portaldot V3 chain. Chain 420420777. Every record carries a Merkle proof you check on chain.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#e6dbc7",
          color: "#062b8a",
          padding: 56,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: "-0.02em", fontWeight: 600 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#062b8a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22 }}>
            R
          </div>
          <div style={{ display: "flex" }}>Rootmark</div>
          <div style={{ display: "flex", marginLeft: 12, padding: "4px 10px", borderRadius: 999, background: "white", border: "1px solid rgba(6,43,138,0.18)", fontSize: 12, fontWeight: 500 }}>
            Portaldot Hacker House 2026 · Track 1
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 1, letterSpacing: "-0.04em" }}>One ledger, two runtimes.</div>
          <div style={{ display: "flex", fontSize: 18, lineHeight: 1.5, maxWidth: 760, opacity: 0.8 }}>
            One query across EVM and ink! events. Every result carries a Merkle proof your own tab rebuilds.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, opacity: 0.7, borderTop: "1px solid rgba(6,43,138,0.14)", paddingTop: 18, marginTop: 12 }}>
          <div style={{ display: "flex" }}>chain 420420777 · tPOT · PortalAnchor 0x92B7…5430</div>
          <div style={{ display: "flex" }}>verifiable middleware · no mock roots</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
