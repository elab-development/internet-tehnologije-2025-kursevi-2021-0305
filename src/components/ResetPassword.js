import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/api-client";

const ResetPassword = () => {
  const { token } = useParams();                 // /reset-password/:token
  const [search] = useSearchParams();
  const initialEmail = search.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const disabled = useMemo(
    () => !email || !password || !confirm || password.length < 8 || password !== confirm,
    [email, password, confirm]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setOk("");

    try {
      await api.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: confirm,
      });

      setOk("Lozinka je uspešno resetovana.");
      setShowModal(true);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.error ||
        data?.message ||
        (typeof data === "object" ? JSON.stringify(data) : e?.message) ||
        "Greška pri resetovanju lozinke.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const closeAndGoLogin = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Postavi novu lozinku</h2>
        <p style={styles.text}>Unesite email, novu lozinku i potvrdu lozinke.</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Nova lozinka (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Potvrdite lozinku"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={styles.input}
          />

          {/* samo prikaz tokena da korisnik zna da je setovan (nije edit-ov) */}
          <input type="text" value={token} readOnly style={{ ...styles.input, background: "#f3f4f6", color: "#6b7280" }} title="Token iz linka" />

          <button type="submit" style={styles.button} disabled={disabled || loading}>
            {loading ? "Čuvam..." : "Resetuj lozinku"}
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
            <p>{ok || "Lozinka je promenjena."}</p>
            <button onClick={closeAndGoLogin} style={styles.button}>U redu</button>
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
  linkButton: {
    background: "none", border: "none", color: "#1e3a8a", fontSize: 14,
    cursor: "pointer", textDecoration: "underline", marginTop: 10,
  },
  modalOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff", padding: 20, borderRadius: 10,
    textAlign: "center", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
};

export default ResetPassword;
