import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBookOpen, FaUserGraduate } from "react-icons/fa";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import useAuth from "../hooks/useAuth";

const PER_PAGE = 4;

const Courses = () => {
  const { user } = useAuth();
  const role = user?.role || "student";
  const userId = user?.id;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // jednostavan filter po nazivu
  const [query, setQuery] = useState("");

  // paginacija
  const [page, setPage] = useState(1);

  // Učitavanje kurseva po ulozi (sa otkazivanjem poziva)
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const url =
          role === "teacher"
            ? `/users/${userId}/courses/teaching`
            : `/users/${userId}/courses/enrolled`;

        // axios v1+ podržava AbortController preko `signal`
        const { data } = await api.get(url, { signal: controller.signal });

        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const normalized = raw.map((c) => ({
          id: c.id,
          title: c.title || c.name || "Bez naziva",
          description: c.description || "",
          
        }));

        if (!alive) return;
        setCourses(normalized);
        setPage(1);
      } catch (e) {
        if (controller.signal.aborted) return; // ignorisi otkazan poziv
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Ne mogu da učitam listu kurseva. Proveri da li si prijavljen i da li API radi.";
        if (!alive) return;
        setErr(msg);
        console.error("GET enrolled/teaching error:", e?.response?.data || e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [userId, role]);

  // Primeni filter po nazivu
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [courses, query]);

  // Paginacija (klijentska)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const current = filtered.slice(start, start + PER_PAGE);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goTo(page - 1);
  const next = () => goTo(page + 1);

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.dashboardContent}>
          <h1 style={styles.title}>
            <FaBookOpen style={{ marginRight: 10 }} />
            {role === "teacher" ? "Kursevi koje predajem" : "Moji kursevi"}
          </h1>

          {/* Pretraga po nazivu */}
          <div style={styles.searchWrap}>
            <input
              type="text"
              placeholder="Pretraži kurseve po nazivu…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1); // reset na prvu pri promeni filtera
              }}
              style={styles.searchInput}
            />
          </div>

          {loading && <p>Učitavam…</p>}
          {err && <p style={{ color: "crimson" }}>{err}</p>}

          {!loading && !err && (
            <>
              {current.length === 0 ? (
                <p>Nema kurseva za prikaz.</p>
              ) : (
                <div style={styles.coursesGrid}>
                  {current.map((course) => (
                    <NavLink
                      key={course.id}
                      to={`/courses/${course.id}`}
                      style={styles.cardLink}
                    >
                      <div style={styles.courseCard}>
                        <h3 style={styles.courseTitle}>{course.title}</h3>
                        {course.teacherName && (
                          <p style={styles.instructor}>
                            <FaUserGraduate style={{ marginRight: 6 }} />
                            {course.teacherName}
                          </p>
                        )}
                        <p style={styles.desc}>{course.description}</p>
                        <div style={{ marginTop: 10 }}>
                          <span style={styles.button}>Pogledaj kurs</span>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Paginacija */}
              {filtered.length > PER_PAGE && (
                <div style={styles.paginationBar}>
                  <button onClick={prev} disabled={page <= 1} style={styles.pageButton}>
                    ← Prethodna
                  </button>

                  <div style={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => goTo(p)}
                        style={{
                          ...styles.pageNumber,
                          ...(p === page ? styles.pageNumberActive : {}),
                        }}
                        aria-current={p === page ? "page" : undefined}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={next}
                    disabled={page >= totalPages}
                    style={styles.pageButton}
                  >
                    Sledeća →
                  </button>

                  <div style={styles.pageLabel}>
                    Stranica {page}/{totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fc" },
  mainContent: { flex: 1, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" },
  dashboardContent: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    width: "80%",
    textAlign: "center",
    maxWidth: "1000px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: { marginBottom: 16 },
  searchInput: {
    width: "100%",
    maxWidth: 480,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 16,
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginTop: "10px",
  },
  cardLink: { textDecoration: "none", color: "inherit" },
  courseCard: {
    background: "#eef2ff",
    padding: "14px",
    borderRadius: "12px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  thumb: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 10,
  },
  courseTitle: { fontSize: "18px", fontWeight: "bold", color: "#1e3a8a", marginBottom: 6 },
  instructor: { fontSize: 13, color: "#555", margin: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  desc: { fontSize: 14, color: "#333", marginTop: 8 },
  button: {
    display: "inline-block",
    padding: "8px 12px",
    backgroundColor: "#1e3a8a",
    color: "white",
    borderRadius: 8,
    fontSize: 14,
  },

  // pagination
  paginationBar: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  pageButton: {
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#1e3a8a",
    color: "white",
    cursor: "pointer",
    borderRadius: "8px",
    minWidth: 120,
    opacity: 1,
  },
  pageNumbers: { display: "flex", alignItems: "center", gap: 6 },
  pageNumber: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #c7d2fe",
    background: "white",
    cursor: "pointer",
  },
  pageNumberActive: {
    background: "#1e3a8a",
    color: "white",
    border: "1px solid #1e3a8a",
  },
  pageLabel: { marginLeft: 8, fontSize: 14, color: "#374151" },
};

export default Courses;
