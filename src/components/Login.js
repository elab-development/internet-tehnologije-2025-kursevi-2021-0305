import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-client";
//import { useAuth } from "../context/AuthContext";
import useAuth from "../hooks/useAuth";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", { email, password });
      // OČEKUJEMO: { message, token, user }
      const token = data?.token;
      const user = data?.user; // ceo user objekat iz Laravela

      if (!token || !user) {
        alert("Neočekivan odgovor servera (fali token ili user).");
        return;
      }

      login(user, token);
      navigate("/dashboard");
    } catch (error) {
      alert("Pogrešan e-mail ili lozinka!");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f7f7f7" },
    card: { width: "350px", backgroundColor: "#fff", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" },
    title: { fontSize: "24px", color: "#333", marginBottom: "20px", fontWeight: "600" },
    form: { display: "flex", flexDirection: "column" },
    input: { margin: "12px 0", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", outline: "none" },
    button: { padding: "12px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
    links: { marginTop: "20px" },
    linkButton: { background: "none", border: "none", color: "#007bff", fontSize: "14px", cursor: "pointer", textDecoration: "underline", margin: "5px" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Prijava</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input type="email" placeholder="Unesite email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Unesite lozinku" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button} disabled={loading}>{loading ? "Prijavljivanje..." : "Prijava"}</button>
        </form>
        <div style={styles.links}>
          <button onClick={() => navigate("/register")} style={styles.linkButton}>Registracija</button>
          <button onClick={() => navigate("/forgot-password")} style={styles.linkButton}>Zaboravljena lozinka?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;