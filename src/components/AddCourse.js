import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaFileUpload, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import api from "../api/api-client"; // axios instance sa baseURL i Authorization headerom

const AddCourse = () => {
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
  });

  const [videoFiles, setVideoFiles] = useState([]);       // video fajlovi
  const [materialFiles, setMaterialFiles] = useState([]); // dodatni materijali (PDF, ZIP, sl.)

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState("");

  // TOAST popup
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const toastTimer = useRef(null);
  const showToast = (message, type = "success", duration = 2500) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, type, message });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), duration);
  };
  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  // samo nastavnici kreiraju kurseve
  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const isTeacher = me?.role === "teacher";

  const onChange = (e) => {
    const { name, value } = e.target;
    setCourseData((s) => ({ ...s, [name]: value }));
  };

  const onPickVideos = (e) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles((arr) => [...arr, ...files]);
  };

  const onPickMaterials = (e) => {
    const files = Array.from(e.target.files || []);
    setMaterialFiles((arr) => [...arr, ...files]);
  };

  const removeVideo = (name) => setVideoFiles((arr) => arr.filter((f) => f.name !== name));
  const removeMat   = (name) => setMaterialFiles((arr) => arr.filter((f) => f.name !== name));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isTeacher) {
      const m = "Samo nastavnici mogu da kreiraju kurseve.";
      setErr(m);
      showToast(m, "error");
      return;
    }
    if (!courseData.title.trim() || !courseData.description.trim()) {
      const m = "Popuni naziv i opis kursa.";
      setErr(m);
      showToast(m, "error");
      return;
    }

    setErr(null);
    setOk("");
    setLoading(true);

    try {
      // 1) Kreiraj kurs
      const res = await api.post("/courses", {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
      });
      const created = res?.data?.data || res?.data;
      const courseId = created?.id;
      if (!courseId) throw new Error("Nije vraćen ID kreiranog kursa.");

      // 2) Upload videa (ako su izabrani)
      if (videoFiles.length > 0) {
        const fd = new FormData();
        videoFiles.forEach((file) => fd.append("videos[]", file));
        await api.post(`/courses/${courseId}/videos/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3) Upload materijala (ako su izabrani)
      if (materialFiles.length > 0) {
        const fd = new FormData();
        materialFiles.forEach((file) => fd.append("materials[]", file));
        await api.post(`/courses/${courseId}/materials/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const successMsg = "Kurs uspešno kreiran.";
      setOk(successMsg);
      showToast(successMsg, "success");

      // kratko pričekaj pa idi na detalje kursa
      setTimeout(() => navigate(`/courses/${courseId}`), 1200);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Greška pri čuvanju kursa.";
      setErr(msg);
      showToast(msg, "error");
      console.error("ADD COURSE error:", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      {/* Toast popup */}
      <div
        style={{
          ...styles.toast,
          ...(toast.show ? styles.toastShow : {}),
          ...(toast.type === "error" ? styles.toastError : styles.toastSuccess),
        }}
        aria-live="polite"
      >
        {toast.type === "error" ? (
          <FaExclamationCircle style={{ marginRight: 8 }} />
        ) : (
          <FaCheckCircle style={{ marginRight: 8 }} />
        )}
        <span>{toast.message}</span>
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>Dodaj novi kurs</h2>

        {!isTeacher && (
          <p style={{ color: "crimson", marginBottom: 12 }}>
            Samo nastavnici mogu da kreiraju kurseve.
          </p>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Naziv kursa:</label>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={onChange}
              style={styles.input}
              required
              placeholder="Unesite naziv kursa"
              disabled={!isTeacher || loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Opis kursa:</label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={onChange}
              style={styles.textarea}
              required
              placeholder="Unesite opis kursa"
              disabled={!isTeacher || loading}
            />
          </div>

          {/* VIDEO fajlovi */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Video lekcije:</label>
            <div style={styles.fileInputWrapper}>
              <input type="file" accept="video/*" onChange={onPickVideos} multiple disabled={!isTeacher || loading} />
              <FaFileUpload style={styles.uploadIcon} />
            </div>

            <div style={styles.materialList}>
              {videoFiles.map((file, i) => (
                <div key={i} style={styles.materialItem}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeVideo(file.name)} style={styles.removeButton}>X</button>
                </div>
              ))}
            </div>
          </div>

          {/* DODATNI MATERIJALI */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Materijali kursa (PDF/ZIP...):</label>
            <div style={styles.fileInputWrapper}>
              <input type="file" onChange={onPickMaterials} multiple disabled={!isTeacher || loading} />
              <FaFileUpload style={styles.uploadIcon} />
            </div>

            <div style={styles.materialList}>
              {materialFiles.map((file, i) => (
                <div key={i} style={styles.materialItem}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeMat(file.name)} style={styles.removeButton}>X</button>
                </div>
              ))}
            </div>
          </div>

          {err && <p style={{ color: "crimson" }}>{err}</p>}
          {ok && <p style={{ color: "green" }}>{ok}</p>}

          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.submitButton} disabled={!isTeacher || loading}>
              <FaPlusCircle style={styles.icon} /> {loading ? "Sačuvavam..." : "Dodaj kurs"}
            </button>
            <button type="button" style={styles.cancelButton} onClick={() => navigate("/dashboard")} disabled={loading}>
              <FaTimes style={styles.icon} /> Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap: { position: "relative" },
  // TOAST
  toast: {
    position: "fixed",
    right: 16,
    top: 16,
    padding: "10px 14px",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    opacity: 0,
    transform: "translateY(-8px)",
    transition: "opacity .2s ease, transform .2s ease",
    zIndex: 1000,
    pointerEvents: "none",
    fontWeight: 600,
  },
  toastShow: {
    opacity: 1,
    transform: "translateY(0)",
  },
  toastSuccess: {
    background: "#e7f9ee",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  toastError: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  // ostatak stila forme
  container: {
    width: "80%",
    maxWidth: "850px",
    margin: "0 auto",
    padding: "40px",
    background: "linear-gradient(135deg, #58a6ff, #d1e8ff)",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "30px",
    fontWeight: "600",
    color: "#333",
  },
  form: { display: "flex", flexDirection: "column", gap: "22px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "18px", fontWeight: "bold", color: "#444" },
  input: { padding: "14px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", color: "#333" },
  textarea: { padding: "14px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", resize: "vertical", minHeight: "150px" },
  fileInputWrapper: { display: "flex", alignItems: "center", gap: "10px" },
  uploadIcon: { fontSize: "22px", color: "#58a6ff", cursor: "pointer", transition: "color 0.3s" },
  materialList: { marginTop: "10px" },
  materialItem: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f4f7fc", padding: "10px", borderRadius: "5px", marginBottom: "8px", boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)" },
  removeButton: { background: "none", border: "none", color: "#ff0000", fontWeight: "bold", cursor: "pointer", fontSize: "18px" },
  buttonContainer: { display: "flex", justifyContent: "space-between", marginTop: "10px" },
  submitButton: { padding: "14px 20px", background: "#58a6ff", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" },
  cancelButton: { padding: "14px 20px", background: "#888", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" },
  icon: { fontSize: "22px" },
};

export default AddCourse;