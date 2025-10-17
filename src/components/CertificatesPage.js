import React, { useContext, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import { AuthContext } from "../context/AuthContext";

const CertificatesPage = () => {
  const { user } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [certs, setCerts] = useState([]);

  // Učitaj sertifikate ulogovanog korisnika
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setErr(null);
      try {
        // fallback ako context nije spreman
        const u = user || JSON.parse(localStorage.getItem("user") || "{}");
        if (!u?.id) {
          setErr("Nije moguće utvrditi korisnika. Prijavite se ponovo.");
          setLoading(false);
          return;
        }

        const { data } = await api.get(`/users/${u.id}/certificates`);
        // Laravel resource kolekcija: { data: [...] } ili plain niz:
        const raw = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        const normalized = raw.map((c) => {
          // pokušaj da izvučeš razumne nazive bez obzira na backend shape
          const title =
            c.title ||
            c.name ||
            c.course_title ||
            c.course?.title ||
            `Sertifikat #${c.id}`;

          const issuedAt =
            c.issued_at ||
            c.awarded_at ||
            c.created_at ||
            null;

          const issuer = c.issuer || "eLearn Platforma";

          return {
            id: c.id,
            title,
            issuedAt,
            issuer,
            // ako backend šalje putanju fajla — može da posluži za prikaz ikone itd.
            path: c.path || c.file_path || null,
          };
        });

        setCerts(normalized);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Ne mogu da učitam sertifikate.";
        setErr(msg);
        console.error("GET /users/{id}/certificates error:", e?.response?.data || e);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  // Preuzimanje PDF-a/sertifikata uz token (ne koristi običan <a> jer treba Authorization header)
  const handleDownload = async (cert) => {
    try {
      const res = await api.get(`/certificates/${cert.id}/download`, {
        responseType: "blob",
      });
      const contentType = res.headers["content-type"] || "application/pdf";
      const blob = new Blob([res.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeTitle = (cert.title || `certificate-${cert.id}`).replace(/[^\w-]+/g, "_");
      // ako backend šalje npr. PNG/JPG, ekstenziju ne znamo sigurno; default .pdf
      a.download = `${safeTitle}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Preuzimanje nije uspelo.";
      setErr(msg);
      console.error("DOWNLOAD /certificates/{id}/download error:", e?.response?.data || e);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Moji sertifikati</h2>

        {loading && <p>Učitavam…</p>}
        {err && !loading && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && !err && (
          <>
            {certs.length === 0 ? (
              <div style={styles.emptyBox}>
                <p>Nemate još uvek sertifikate.</p>
              </div>
            ) : (
              <div style={styles.certificateList}>
                {certs.map((c) => (
                  <div key={c.id} style={styles.certificateItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ textAlign: "left" }}>
                        <h3 style={styles.certificateTitle}>{c.title}</h3>
                        <p style={styles.certificateDetails}>
                          Izdavač: <b>{c.issuer}</b>
                          {c.issuedAt ? (
                            <>
                              {" "} | Izdato:{" "}
                              {new Date(c.issuedAt).toLocaleDateString()}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          onClick={() => handleDownload(c)}
                          style={styles.downloadBtn}
                          title="Preuzmi sertifikat"
                        >
                          Preuzmi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <footer style={styles.footer}>
              <p>&copy; {new Date().getFullYear()} eLearn. Sva prava zadržana.</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f7fc",
  },
  mainContent: {
    flex: 1,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
    color: "#1e3a8a",
  },
  certificateList: {
    width: "92%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  certificateItem: {
    background: "#fff",
    padding: "18px 20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  certificateTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  certificateDetails: {
    fontSize: "14px",
    color: "#4b5563",
    marginTop: 6,
  },
  downloadBtn: {
    padding: "10px 14px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  },
  emptyBox: {
    width: "100%",
    maxWidth: 700,
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    color: "#6b7280",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    background: "#1e3a8a",
    color: "#fff",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "12px",
  },
};

export default CertificatesPage;
