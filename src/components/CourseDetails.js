// src/components/CourseDetails.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import { AuthContext } from "../context/AuthContext";

// (opciono) mapiranje naslova na teme
const TOPIC_MAP = {
  "Uvod u programiranje": "Computer programming",
  "Baze podataka": "Relational database",
  "Web dizajn": "Responsive web design",
  "Algoritmi i strukture podataka": "Data structure",
  "Laravel osnove": "Laravel (web framework)",
  "React za početnike": "React (web framework)",
  "Ionic mobilne aplikacije": "Ionic (framework)",
  "Digitalni marketing": "Digital marketing",
  "Projektni menadžment": "Project management",
  "Blockchain osnove": "Blockchain",
};

async function fetchWikiSummary(topic) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  const res = await fetch(url, { headers: { "accept-language": "sr,en;q=0.8" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Wikipedia API error");
  const data = await res.json();
  return {
    title: data.title,
    extract: data.extract,
    url: data?.content_urls?.desktop?.page || data?.content_urls?.mobile?.page || null,
  };
}

async function fetchBooks(topic, limit = 5) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Open Library API error");
  const data = await res.json();
  const docs = Array.isArray(data?.docs) ? data.docs : [];
  return docs.map((d) => ({
    title: d.title,
    author: (d.author_name && d.author_name[0]) || "Unknown",
    first_publish_year: d.first_publish_year || null,
    cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    openlibrary_url: d.key ? `https://openlibrary.org${d.key}` : null,
  }));
}

// util
function dedupePathOnce(s) {
  if (!s) return s;
  return s.replace(/(\.(mp4|webm|mov|m4v)).*\1/i, "$1");
}
function pickVideoPath(v) {
  if (!v) return "";
  const direct = v.path || v.file_path || v.video_path || v.media_path || v.source || v?.pivot?.path;
  if (direct) return String(direct);
  for (const [, val] of Object.entries(v)) {
    if (typeof val === "string" && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(val)) return val;
  }
  return "";
}
function fileNameFromPath(p, fallback = "download") {
  if (!p) return fallback;
  try {
    const last = String(p).split("/").pop() || "";
    return decodeURIComponent(last) || fallback;
  } catch {
    return fallback;
  }
}

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext) || {};
  const me = user || JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = (me?.role || "student") === "student";

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // upis
  const [checkingEnroll, setCheckingEnroll] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  // akcije
  const [enrolling, setEnrolling] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // modal sertifikata
  const [certModal, setCertModal] = useState({ show: false, downloadUrl: "", label: "" });

  // javni podaci
  const [wiki, setWiki] = useState(null);
  const [books, setBooks] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);

  // /storage baza
  const API_BASE = useMemo(() => (api.defaults.baseURL || "").replace(/\/api\/?$/, ""), []);
  const toPublicUrl = (p) => {
    if (!p) return "";
    let s = String(p).trim();
    s = dedupePathOnce(s);
    if (/^https?:\/\//i.test(s)) return s;
    const clean = s.replace(/^\/+/, "").replace(/^public\//, "").replace(/^storage\//, "");
    return `${API_BASE}/storage/${clean}`;
  };

  // 1) učitaj kurs
  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get(`/courses/${id}`);
        const c = data?.data || data || null;
        setCourse(c);

        // videi
        if (Array.isArray(c?.videos)) setVideos(c.videos);
        else {
          try {
            const { data: v } = await api.get(`/courses/${id}/videos`);
            if (Array.isArray(v)) setVideos(v);
          } catch {}
        }

        // materijali
        if (Array.isArray(c?.materials)) setMaterials(c.materials);
        else {
          try {
            const { data: m } = await api.get(`/courses/${id}/materials`);
            if (Array.isArray(m)) setMaterials(m);
          } catch {}
        }
      } catch (e) {
        setErr("Ne mogu da učitam kurs.");
        console.error("GET /courses/:id", e?.response?.data || e);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  // 2) proveri da li je korisnik upisan
  useEffect(() => {
    const checkEnroll = async () => {
      if (!me?.id) {
        setCheckingEnroll(false);
        setEnrolled(false);
        return;
      }
      setCheckingEnroll(true);

      // a) pokušaj da pročitaš iz course.enrollments (ako je backend uključio)
      let found = false;
      const c = course;
      if (c && Array.isArray(c.enrollments)) {
        found = c.enrollments.some((e) => {
          // pokrivamo više šema: { user_id }, { user: { id } }, ili direktni id usera
          const uid = Number(
            e?.user_id ??
              e?.user?.id ??
              e?.student_id ?? // ako se tako zove u pivotu
              e?.id // ponekad resource vrati direkt listu user-a
          );
        return uid === Number(me.id);
        });
      }

      if (!found) {
        // b) fallback: GET /users/{me}/courses/enrolled i proveri da li ima ovaj course.id
        try {
          const { data } = await api.get(`/users/${me.id}/courses/enrolled`);
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          found = list.some((x) => Number(x?.id) === Number(id));
        } catch (e) {
          // ignoriši, pretpostavi false
        }
      }

      setEnrolled(found);
      setCheckingEnroll(false);
    };

    checkEnroll();
  }, [course, me?.id, id]);

  // 3) javni API (opciono)
  useEffect(() => {
    if (!course?.title && !course?.name) return;
    const title = course.title || course.name || "";
    const topic = TOPIC_MAP[title] || title || "Computer programming";

    let alive = true;
    setPublicLoading(true);
    setWiki(null);
    setBooks([]);

    (async () => {
      try {
        const [w, b] = await Promise.all([fetchWikiSummary(topic), fetchBooks(topic, 5)]);
        if (!alive) return;
        setWiki(w || null);
        setBooks(b);
      } catch (e) {
        if (!alive) return;
        console.warn("Public APIs error", e);
      } finally {
        if (alive) setPublicLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [course?.title, course?.name]);

  const doEnroll = async () => {
    if (!isStudent) return;
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true); // odmah omogući "Završi kurs"
      alert("Uspešno ste se prijavili na kurs.");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Greška pri prijavi.";
      alert(msg);
    } finally {
      setEnrolling(false);
    }
  };

  const finishCourse = async () => {
    if (!isStudent) return;
    if (!enrolled) {
      alert("Morate biti prijavljeni na kurs da biste ga završili.");
      return;
    }
    setFinishing(true);
    try {
      // pokušaj JSON – očekujemo { data: { id } } ili { id }
      const res = await api.get(`/courses/${id}/certificate`, { validateStatus: () => true });
      const ct = (res.headers && res.headers["content-type"]) || "";

      if (!ct.includes("application/json")) {
        // PDF/strem – uzmi kao blob
        const blobRes = await api.get(`/courses/${id}/certificate`, { responseType: "blob" });
        const blob = new Blob([blobRes.data], { type: blobRes.headers["content-type"] || "application/pdf" });
        const url = URL.createObjectURL(blob);
        setCertModal({ show: true, downloadUrl: url, label: "Preuzmi sertifikat (PDF)" });
      } else {
        const payload = res.data || {};
        const cert = payload.data || payload;
        const certId = cert?.id;
        if (certId) {
          const apiBase = api.defaults.baseURL?.replace(/\/+$/, "") || "";
          const dl = `${apiBase}/certificates/${certId}/download`;
          setCertModal({ show: true, downloadUrl: dl, label: "Preuzmi sertifikat" });
        } else {
          setCertModal({ show: true, downloadUrl: "", label: "" });
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Greška pri generisanju sertifikata.";
      alert(msg);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fc" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        <NavLink to="/courses" style={{ textDecoration: "underline" }}>
          ← Nazad na kurseve
        </NavLink>

        {loading && <p>Učitavam...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {course && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginTop: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ marginTop: 0 }}>{course.title || course.name}</h2>
                {course.teacher?.name && <p>Predavač: {course.teacher.name}</p>}
              </div>

              {/* Akcije za studente */}
              {isStudent && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={doEnroll}
                    disabled={enrolled || enrolling}
                    style={{
                      padding: "10px 14px",
                      backgroundColor: enrolled ? "#16a34a" : "#1e3a8a",
                      color: "#fff",
                      border: 0,
                      borderRadius: 8,
                      cursor: enrolled ? "default" : "pointer",
                      minWidth: 140,
                      height: 40,
                    }}
                    title={enrolled ? "Već ste upisani" : "Prijavi se na kurs"}
                  >
                    {enrolled ? "Upisan ✓" : enrolling ? "Prijavljujem…" : "Prijavi se"}
                  </button>

                  <button
                    onClick={finishCourse}
                    disabled={checkingEnroll || !enrolled || finishing}
                    style={{
                      padding: "10px 14px",
                      backgroundColor: !enrolled || checkingEnroll ? "#9ca3af" : "#0ea5e9",
                      color: "#fff",
                      border: 0,
                      borderRadius: 8,
                      cursor: !enrolled || checkingEnroll ? "not-allowed" : "pointer",
                      minWidth: 140,
                      height: 40,
                    }}
                    title={
                      checkingEnroll
                        ? "Provera upisa…"
                        : !enrolled
                        ? "Prvo se prijavite na kurs"
                        : "Završi kurs i preuzmi sertifikat"
                    }
                  >
                    {finishing ? "Obrađujem…" : checkingEnroll ? "Provera…" : "Završi kurs"}
                  </button>
                </div>
              )}
            </div>

            <p style={{ marginTop: 8 }}>{course.description}</p>

            {/* Javni REST: Wikipedia + Open Library (opciono) */}
            {!publicLoading && (wiki || books.length > 0) && (
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {wiki && (
                  <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                    <h3 style={{ margin: "0 0 8px 0" }}>O temi (Wikipedia)</h3>
                    <p style={{ margin: 0 }}>{wiki.extract}</p>
                    {wiki.url && (
                      <p style={{ marginTop: 8 }}>
                        <a href={wiki.url} target="_blank" rel="noreferrer">Pročitaj više</a>
                      </p>
                    )}
                  </div>
                )}

                {books.length > 0 && (
                  <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                    <h3 style={{ margin: "0 0 8px 0" }}>Preporučene knjige (Open Library)</h3>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {books.map((bk, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          <strong>{bk.title}</strong> — {bk.author}
                          {bk.first_publish_year ? ` (${bk.first_publish_year})` : ""}
                          {bk.openlibrary_url && <> · <a href={bk.openlibrary_url} target="_blank" rel="noreferrer">Detalji</a></>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {publicLoading && <div style={{ opacity: 0.7, marginTop: 12 }}>Učitavam javne podatke…</div>}

            {/* Video lekcije */}
            {videos.length > 0 ? (
              <>
                <h3 style={{ marginTop: 24 }}>Video lekcije</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  {videos.map((v) => {
                    const rawPath = pickVideoPath(v);
                    const videoSrc = rawPath ? toPublicUrl(rawPath) : v.url || "";
                    const fileName = v.original_name || fileNameFromPath(rawPath, "video.mp4");
                    return (
                      <div
                        key={v.id}
                        style={{
                          background: "#eef2ff",
                          borderRadius: 10,
                          padding: 12,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                          {v.title || `Video #${v.id}`}
                        </div>

                        {videoSrc ? (
                          <>
                            <video src={videoSrc} controls style={{ width: "100%", borderRadius: 8 }} />
                            <div style={{ marginTop: 8 }}>
                              <a
                                href={videoSrc}
                                download={fileName}
                                style={{ color: "#1e3a8a", textDecoration: "underline" }}
                              >
                                Preuzmi video
                              </a>
                            </div>
                          </>
                        ) : (
                          <div style={{ opacity: 0.7 }}>Nema video fajla</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p style={{ opacity: 0.7, marginTop: 12 }}>Još uvek nema dodatih videa za ovaj kurs.</p>
            )}

            {/* Materijali */}
            {materials.length > 0 && (
              <>
                <h3 style={{ marginTop: 24 }}>Materijali</h3>
                <ul style={{ marginTop: 8 }}>
                  {materials.map((m) => {
                    const href = toPublicUrl(m.path);
                    const dlName = m.original_name || fileNameFromPath(m.path, "materijal");
                    return (
                      <li key={m.id} style={{ marginBottom: 6 }}>
                        <a
                          href={href}
                          download={dlName}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#1e3a8a" }}
                          title={dlName}
                        >
                          {m.original_name || m.path}
                        </a>
                        {m.size ? (
                          <span style={{ opacity: 0.7, marginLeft: 8 }}>
                            ({Math.round((Number(m.size) || 0) / 1024)} KB)
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Modal: sertifikat uspešno kreiran */}
        {certModal.show && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "grid",
              placeItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                width: "min(92vw, 460px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Uspešno ste završili kurs! 🎉</h3>
              <p style={{ marginTop: 6 }}>
                Sertifikat je upisan u vašu evidenciju.
                {certModal.downloadUrl ? " Možete ga odmah preuzeti:" : ""}
              </p>
              {certModal.downloadUrl && (
                <div style={{ marginTop: 10 }}>
                  <a
                    href={certModal.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      background: "#1e3a8a",
                      color: "#fff",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {certModal.label || "Preuzmi sertifikat"}
                  </a>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <button
                  onClick={() => setCertModal({ show: false, downloadUrl: "", label: "" })}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
