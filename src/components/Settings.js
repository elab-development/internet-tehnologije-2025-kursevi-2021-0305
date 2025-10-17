import React, { useEffect, useState, useContext } from "react";
import { User, Mail, Check, UserCircle, Shield } from "lucide-react";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import { AuthContext } from "../context/AuthContext";

const Settings = () => {
  const { setUser } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState("");

  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "", // opciono
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Učitaj trenutnog korisnika (SAMO JEDNOM)
  const fetchMe = async () => {
    setLoading(true);
    setErr(null);
    setOk("");
    let mounted = true;
    try {
      const { data } = await api.get("/me"); // mora Bearer token u headeru
      // podrži i Resource i plain JSON
      const u = data?.data ? data.data : data;

      if (mounted) {
        setMe(u);
        setForm({
          name: u?.name || "",
          email: u?.email || "",
          role: u?.role || "",
          password: "", // nikad ne punimo lozinku iz backenda
        });

        // osveži localStorage korisnika (korisno za Sidebar) i kontekst
        const merged = {
          id: u?.id,
          name: u?.name,
          email: u?.email,
          role: u?.role,
        };
        localStorage.setItem("user", JSON.stringify(merged));
        if (typeof setUser === "function") setUser(merged);
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Ne mogu da učitam podatke vašeg naloga.";
      if (mounted) {
        setErr(`Greška (${status ?? "—"}): ${msg}`);
        console.error("GET /me error:", e?.response?.data || e);
      }
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchMe();
    })();
    return () => {
      cancelled = true;
    };
  }, []); // <= VAŽNO: samo jednom

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((fe) => ({ ...fe, [name]: null }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    setErr(null);
    setOk("");
    setFieldErrors({});
    try {
      const payload = {
        name: form.name,
        email: form.email,
      };
      if (form.password && form.password.length >= 6) {
        payload.password = form.password;
      }

      const { data } = await api.put(`/users/${me.id}`, payload);
      const updated = data?.data ? data.data : data || {};

      setOk("Uspešno sačuvano.");
      setForm((prev) => ({ ...prev, password: "" }));
      setMe((m) => ({ ...m, ...updated }));

      // osveži localStorage + AuthContext user
      const merged = {
        id: updated.id ?? me.id,
        name: updated.name ?? form.name,
        email: updated.email ?? form.email,
        role: updated.role ?? me.role,
      };
      localStorage.setItem("user", JSON.stringify(merged));
      if (typeof setUser === "function") setUser(merged);
    } catch (e) {
      const status = e?.response?.status;
      const resp = e?.response?.data;
      if (resp?.errors && typeof resp.errors === "object") {
        const fe = {};
        Object.entries(resp.errors).forEach(([k, v]) => {
          fe[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFieldErrors(fe);
      }
      const msg =
        resp?.message ||
        (typeof resp === "object" ? JSON.stringify(resp) : e?.message) ||
        "Greška pri čuvanju podataka.";
      setErr(`Greška (${status ?? "—"}): ${msg}`);
      console.error("PUT /users/:id error:", resp || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <h2 style={styles.mainTitle}>Vaš nalog</h2>

        {loading ? (
          <p>Učitavam podatke…</p>
        ) : err ? (
          <p style={{ color: "crimson" }}>{err}</p>
        ) : (
          <form style={styles.form} onSubmit={onSubmit}>
            <div style={styles.inputGroup}>
              <UserCircle size={20} />
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Ime i prezime"
                  value={form.name}
                  onChange={onChange}
                  style={{
                    ...styles.input,
                    borderColor: fieldErrors.name ? "#dc2626" : "#ddd",
                  }}
                  required
                />
                {fieldErrors.name && (
                  <div style={styles.errorText}>{fieldErrors.name}</div>
                )}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <Mail size={20} />
              <div style={{ flex: 1 }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  style={{
                    ...styles.input,
                    borderColor: fieldErrors.email ? "#dc2626" : "#ddd",
                  }}
                  required
                />
                {fieldErrors.email && (
                  <div style={styles.errorText}>{fieldErrors.email}</div>
                )}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <Shield size={20} />
              <input
                type="text"
                value={form.role || ""}
                readOnly
                style={{
                  ...styles.input,
                  background: "#f9fafb",
                  color: "#6b7280",
                  cursor: "not-allowed",
                }}
                title="Uloge se ne menjaju na ovoj stranici"
              />
            </div>

            <div style={styles.inputGroup}>
              <User size={20} />
              <div style={{ flex: 1 }}>
                <input
                  type="password"
                  name="password"
                  placeholder="Nova lozinka (opciono, min 6)"
                  value={form.password}
                  onChange={onChange}
                  style={{
                    ...styles.input,
                    borderColor: fieldErrors.password ? "#dc2626" : "#ddd",
                  }}
                />
                {fieldErrors.password && (
                  <div style={styles.errorText}>{fieldErrors.password}</div>
                )}
              </div>
            </div>

            <button type="submit" style={styles.submitButton} disabled={saving}>
              <Check size={20} style={{ marginRight: 8 }} />
              {saving ? "Čuvam…" : "Potvrdi izmene"}
            </button>

            {ok && <p style={{ color: "green", marginTop: 12 }}>{ok}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fc" },
  mainContent: { flex: 1, padding: "40px", display: "flex", flexDirection: "column", alignItems: "center" },
  mainTitle: { fontSize: "30px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "30px" },
  form: { width: "100%", maxWidth: "600px", background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column" },
  inputGroup: { display: "flex", alignItems: "center", gap: 10, marginBottom: "15px" },
  input: { flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px", background: "#fff", width: "100%" },
  submitButton: { padding: "12px", backgroundColor: "#1e3a8a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "8px" },
  errorText: { color: "#dc2626", fontSize: 12, marginTop: 6 },
};

export default Settings;
