import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [token, setToken] = useState(null); // dev: backend vraća originalni token
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setToken(null);

    try {
      // POST /forgot-password -> { message, token }
      const { data } = await api.post("/forgot-password", { email });
      setToken(data?.token || null);
      setShowModal(true);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "Greška prilikom slanja zahteva.";
      setErr(msg);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    // token prosledimo kroz URL param; email stavimo u query radi auto-popune
    navigate(`/reset-password/${encodeURIComponent(token)}?email=${encodeURIComponent(email)}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Zaboravljena lozinka</h2>
        <p style={styles.text}>Unesite email na koji je registrovan nalog.</p>

        <form onSubmit={handleRequest} style={styles.form}>
          <input
            type="email"
            placeholder="Unesite email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Šaljem..." : "Pošalji link za reset"}
          </button>
        </form>

        {err && <p style={{ color: "crimson", marginTop: 10 }}>{err}</p>}

        <button onClick={() => navigate("/")} style={styles.linkButton}>
          Vrati se na prijavu
        </button>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={{ marginBottom: 10 }}>
              Link za reset je generisan.
            </p>

            {/* DEV pomoć: backend vraća token u JSON-u.
               U produkciji bi token došao mailom; ovde samo omogućavamo nastavak. */}
            {token && (
              <div style={styles.tokenBox}>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>Token:</div>
                <code style={{ fontSize: 12, wordBreak: "break-all" }}>{token}</code>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowModal(false)} style={styles.secondaryBtn}>
                Zatvori
              </button>
              {token && (
                <button onClick={goToReset} style={styles.button}>
                  Nastavi na reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", backgroundColor: "#f7f7f7",
  },
  card: {
    width: 360, backgroundColor: "#fff", padding: 30, borderRadius: 15,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center",
  },
  title: { fontSize: 24, color: "#333", marginBottom: 10, fontWeight: 600 },
  text: { fontSize: 14, color: "#666", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column" },
  input: {
    margin: "12px 0", padding: 12, fontSize: 16, border: "1px solid #ddd",
    borderRadius: 8, outline: "none",
  },
  button: {
    padding: 12, background: "#1e3a8a", color: "white", border: "none",
    borderRadius: 8, fontSize: 16, cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 12px", background: "#e5e7eb", color: "#111827", border: "none",
    borderRadius: 8, fontSize: 14, cursor: "pointer",
  },
  linkButton: {
    background: "none", border: "none", color: "#1e3a8a", fontSize: 14,
    cursor: "pointer", textDecoration: "underline", marginTop: 10,
  },
  modalOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff", padding: 20, borderRadius: 12,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)", minWidth: 320, textAlign: "center",
  },
  tokenBox: {
    background: "#f3f4f6", border: "1px solid #e5e7eb",
    borderRadius: 8, padding: 10, textAlign: "left",
  },
};

export default ForgotPassword;