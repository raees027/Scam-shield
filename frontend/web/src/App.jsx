import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

const CHIPS = [
  { label: "UPI ID", type: "upi", placeholder: "e.g. paytm-support@ybl" },
  { label: "Phone", type: "phone", placeholder: "e.g. 9876543210" },
  { label: "URL", type: "url", placeholder: "e.g. pay.fake-site.com" },
];

const RISK_COLORS = {
  SCAM: { bg: "#FCEBEB", border: "#A32D2D", text: "#791F1F", badge: "#A32D2D" },
  SUSPICIOUS: {
    bg: "#FAEEDA",
    border: "#854F0B",
    text: "#633806",
    badge: "#854F0B",
  },
  SAFE: { bg: "#EAF3DE", border: "#3B6D11", text: "#27500A", badge: "#27500A" },
};

export default function App() {
  const [chip, setChip] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/reports/recent`)
      .then((r) => setReports(r.data))
      .catch(() => {});
    axios
      .get(`${API}/api/stats`)
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  async function handleScan() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const type = CHIPS[chip].type;
    if (type === "upi" && !trimmed.includes("@")) {
      alert('UPI IDs must contain "@" — e.g. name@bank');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/api/scan`, { value: trimmed, type });
      setResult(res.data);
    } catch {
      alert("Could not reach server. Try again in 20 seconds.");
    } finally {
      setLoading(false);
    }
  }

  const c = result ? RISK_COLORS[result.riskLevel] : null;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: "#F5F5F5",
      }}
    >
      {/* Header */}
      <div style={{ background: "#185FA5", padding: "20px 24px 32px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 22, color: "#fff" }}>🛡️</span>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>
              ScamShield
            </span>
          </div>
          <p style={{ color: "#B5D4F4", fontSize: 13, margin: 0 }}>
            Protect yourself from UPI fraud
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 680,
          margin: "-20px auto 0",
          padding: "0 16px 40px",
        }}
      >
        {/* Search card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Check before you pay
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {CHIPS.map((ch, i) => (
              <button
                key={ch.type}
                onClick={() => {
                  setChip(i);
                  setInput("");
                  setResult(null);
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  border: i === chip ? "1.5px solid #185FA5" : "1px solid #ddd",
                  background: i === chip ? "#E6F1FB" : "#F5F5F5",
                  color: i === chip ? "#0C447C" : "#666",
                  fontWeight: i === chip ? 600 : 400,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder={CHIPS[chip].placeholder}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleScan}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                background: "#185FA5",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {loading ? "..." : "Scan"}
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              background: "#F0F0F0",
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {[60, 80, 40].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 12,
                  background: "#DDD",
                  borderRadius: 6,
                  width: `${w}%`,
                  marginBottom: 8,
                }}
              />
            ))}
          </div>
        )}

        {/* Result card */}
        {!loading && result && c && (
          <div
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  background: c.badge,
                  color: "#fff",
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {result.riskLevel}
              </span>
              <span style={{ color: c.text, fontWeight: 600, fontSize: 13 }}>
                {result.riskScore}/100
              </span>
            </div>
            <p style={{ color: c.text, fontWeight: 600, margin: "0 0 4px" }}>
              {result.value}
            </p>
            <p
              style={{ color: c.text, fontSize: 13, margin: 0, opacity: 0.85 }}
            >
              {result.reason}
            </p>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              {
                num: stats.totalScamsBlocked,
                label: "Scams blocked",
                color: "#A32D2D",
              },
              {
                num: stats.totalSuspicious,
                label: "Suspicious flagged",
                color: "#854F0B",
              },
              {
                num: stats.totalUserReports,
                label: "User reports",
                color: "#185FA5",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent reports */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            margin: "0 0 10px",
            color: "#1A1A1A",
          }}
        >
          Recent reports
        </h3>
        {reports.map((item, i) => {
          const rc = RISK_COLORS[item.risk_level] || RISK_COLORS.SUSPICIOUS;
          return (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #eee",
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {item.value}
                </span>
                <span
                  style={{
                    background: rc.badge,
                    color: "#fff",
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {item.risk_level}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                {item.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
