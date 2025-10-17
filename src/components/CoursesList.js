// src/components/CoursesList.jsx
import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import {
  FaUserGraduate,
  FaBookOpen,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import { AuthContext } from "../context/AuthContext";

const PER_PAGE_DEFAULT = 8;

const CoursesList = () => {
  const { user } = useContext(AuthContext) || {};
  const me = user || JSON.parse(localStorage.getItem("user") || "{}");
  const role = me?.role || "student";
  const isStudent = role === "student";

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const perPageFromUrl = parseInt(
    searchParams.get("per_page") || String(PER_PAGE_DEFAULT),
    10
  );
  const instructorFromUrl = searchParams.get("instructor") || "";
  const qFromUrl = searchParams.get("q") || "";

  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [perPage, setPerPage] = useState(perPageFromUrl);
  const [instructor, setInstructor] = useState(instructorFromUrl);
  const [q, setQ] = useState(qFromUrl);
  const [teachers, setTeachers] = useState([]);

  // set up enrolled IDs (za studente)
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrolling, setEnrolling] = useState({}); // { [courseId]: boolean }

  const fetchCourses = async (page, perPageVal, instructorVal, qVal) => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(perPageVal));
      if (instructorVal) params.set("instructor", instructorVal);
      if (qVal) params.set("q", qVal);

      const { data } = await api.get(`/courses?${params.toString()}`);

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      const normalized = list.map((c) => ({
        id: c.id,
        title: c.title || c.name || "Bez naziva",
        description: c.description || "",
        teacherName: c.teacher?.name || null,
      }));
      setCourses(normalized);

      let m =
        data?.meta ??
        (typeof data?.current_page !== "undefined"
          ? {
              current_page: Number(data.current_page) || page,
              last_page: Number(data.last_page) || 1,
              per_page: Number(data.per_page) || perPageVal,
              total: Number(data.total) || normalized.length,
              has_prev: !!data.prev_page_url,
              has_next: !!data.next_page_url,
            }
          : null);

      if (!m) {
        m = {
          current_page: page,
          last_page: 1,
          per_page: perPageVal,
          total: normalized.length,
          has_prev: false,
          has_next: false,
        };
      }
      setMeta(m);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || "Nepoznata greška";
      setErr(`Greška (${status ?? "—"}): ${msg}`);
      console.error("GET /courses error:", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(pageFromUrl, perPageFromUrl, instructorFromUrl, qFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl, perPageFromUrl, instructorFromUrl, qFromUrl]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/teachers");
        if (Array.isArray(data)) setTeachers(data);
      } catch {
        setTeachers([]);
      }
    })();
  }, []);

  // povuci koje je kurseve student već upisao
  useEffect(() => {
    (async () => {
      if (!isStudent || !me?.id) return;
      try {
        const { data } = await api.get(`/users/${me.id}/courses/enrolled`);
        // backend vraća niz kurseva => izvuci ID-eve
        const ids = new Set(
          (Array.isArray(data) ? data : []).map((c) => c.id)
        );
        setEnrolledIds(ids);
      } catch (e) {
        console.warn("GET enrolled failed", e?.response?.data || e);
      }
    })();
  }, [isStudent, me?.id]);

  const goToPage = (p) => {
    const last = meta?.last_page || 1;
    const clamped = Math.max(1, Math.min(p, last));
    setSearchParams({
      page: String(clamped),
      per_page: String(perPage),
      instructor: instructor ? instructor : "",
      q: q ? q : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changePerPage = (e) => {
    const val = parseInt(e.target.value, 10);
    setPerPage(val);
    setSearchParams({
      page: "1",
      per_page: String(val),
      instructor: instructor ? instructor : "",
      q: q ? q : "",
    });
  };

  const applyInstructor = (name) => {
    setInstructor(name);
    setSearchParams({
      page: "1",
      per_page: String(perPage),
      instructor: name,
      q: q ? q : "",
    });
  };

  const resetInstructor = () => {
    setInstructor("");
    setSearchParams({
      page: "1",
      per_page: String(perPage),
      instructor: "",
      q: q ? q : "",
    });
  };

  const applySearch = (e) => {
    e?.preventDefault?.();
    setSearchParams({
      page: "1",
      per_page: String(perPage),
      instructor: instructor ? instructor : "",
      q: q ? q : "",
    });
  };

  const enroll = async (courseId) => {
    if (!isStudent) return;
    setEnrolling((s) => ({ ...s, [courseId]: true }));
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledIds((s) => new Set([...Array.from(s), courseId]));
      alert("Uspešno ste se prijavili na kurs.");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Greška pri prijavi.";
      alert(msg);
    } finally {
      setEnrolling((s) => ({ ...s, [courseId]: false }));
    }
  };

  const renderPageButtons = () => {
    if (!meta) return null;
    const cur = meta.current_page || 1;
    const last = meta.last_page || 1;
    const around = 2;
    const pages = new Set([1, last]);
    for (let p = cur - around; p <= cur + around; p++) {
      if (p >= 1 && p <= last) pages.add(p);
    }
    const ordered = Array.from(pages).sort((a, b) => a - b);
    const buttons = [];
    let prev = 0;
    ordered.forEach((p, idx) => {
      if (prev && p - prev > 1)
        buttons.push(
          <span key={`el-${idx}`} style={styles.ellipsis}>
            …
          </span>
        );
      buttons.push(
        <button
          key={p}
          style={p === cur ? styles.pagePillActive : styles.pagePill}
          onClick={() => goToPage(p)}
          disabled={p === cur}
        >
          {p}
        </button>
      );
      prev = p;
    });
    return buttons;
  };

  const chipTeachers = teachers.length
    ? teachers.map((t) => ({ id: t.id, name: t.name }))
    : Array.from(
        new Set(courses.map((c) => c.teacherName).filter(Boolean))
      ).map((name, i) => ({ id: i + 1, name }));

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.dashboardContent}>
          <h1 style={styles.title}>
            <FaBookOpen /> Kursevi
          </h1>

          <form style={styles.filterRow} onSubmit={applySearch}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraga po nazivu/opisu..."
              style={styles.searchInput}
            />
            <div style={styles.perPageBox}>
              <label style={{ marginRight: 8 }}>Po stranici:</label>
              <select value={perPage} onChange={changePerPage} style={styles.select}>
                {[4, 8, 12, 24, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" style={styles.searchBtn}>
              Pretraži
            </button>
          </form>

          <div style={styles.instructorsList}>
            {chipTeachers.map((t) => (
              <button
                key={t.id}
                onClick={() => applyInstructor(t.name)}
                style={{
                  ...styles.instructorButton,
                  ...(instructor === t.name ? styles.activeInstructor : {}),
                }}
              >
                <FaUserGraduate style={styles.instructorIcon} /> {t.name}
              </button>
            ))}
            {instructor && (
              <button onClick={resetInstructor} style={styles.resetButton}>
                Prikaži sve
              </button>
            )}
          </div>

          {loading && <p>Učitavam...</p>}
          {err && <p style={{ color: "crimson" }}>{err}</p>}

          {!loading && !err && (
            <>
              <div style={styles.coursesGrid}>
                {courses.length ? (
                  courses.map((course) => {
                    const already = enrolledIds.has(course.id);
                    return (
                      <div key={course.id} style={styles.courseCard}>
                        <div style={styles.courseInfo}>
                          <h3 style={styles.courseTitle}>{course.title}</h3>
                          {course.teacherName && (
                            <p style={styles.instructor}>
                              <FaUserGraduate /> {course.teacherName}
                            </p>
                          )}
                          <p style={{ fontSize: 14 }}>{course.description}</p>

                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <NavLink to={`/courses/${course.id}`} style={styles.button}>
                              Detalji
                            </NavLink>

                            {isStudent && (
                              <button
                                onClick={() => enroll(course.id)}
                                disabled={already || enrolling[course.id]}
                                style={{
                                  ...styles.button,
                                  backgroundColor: already ? "#16a34a" : "#1e3a8a",
                                }}
                              >
                                {already ? "Upisan ✓" : enrolling[course.id] ? "Prijavljujem…" : "Prijavi se"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Nema kurseva za izabrani filter.</p>
                )}
              </div>

              {meta && (meta.last_page > 1 || meta.has_prev || meta.has_next) && (
                <div style={styles.paginationBar}>
                  <div style={styles.pageInfoRow}>
                    <span>
                      Stranica <strong>{meta.current_page || 1}</strong> / {meta.last_page || 1}
                    </span>
                    {typeof meta.total !== "undefined" && (
                      <>
                        <span style={styles.dot}>•</span>
                        <span>Ukupno: {meta.total}</span>
                      </>
                    )}
                  </div>

                  <div style={styles.pageControls}>
                    <button onClick={() => goToPage(1)} disabled={(meta.current_page || 1) <= 1} style={styles.navBtn} title="Prva">
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      onClick={() => goToPage((meta.current_page || 1) - 1)}
                      disabled={(meta.current_page || 1) <= 1}
                      style={styles.navBtn}
                      title="Prethodna"
                    >
                      <FaAngleLeft />
                    </button>

                    <div style={styles.pageNumbersWrap}>{renderPageButtons()}</div>

                    <button
                      onClick={() => goToPage((meta.current_page || 1) + 1)}
                      disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
                      style={styles.navBtn}
                      title="Sledeća"
                    >
                      <FaAngleRight />
                    </button>
                    <button
                      onClick={() => goToPage(meta.last_page || 1)}
                      disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
                      style={styles.navBtn}
                      title="Zadnja"
                    >
                      <FaAngleDoubleRight />
                    </button>
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
  title: { fontSize: "30px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "20px" },

  filterRow: { display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  searchInput: { padding: "10px", border: "1px solid #ddd", borderRadius: 8, width: 260 },
  perPageBox: { display: "flex", alignItems: "center" },
  select: { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" },
  searchBtn: { padding: "10px 16px", background: "#1e3a8a", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" },

  instructorsList: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "20px" },
  instructorButton: {
    padding: "10px 14px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  activeInstructor: { backgroundColor: "#0056b3" },
  instructorIcon: { marginRight: "8px" },
  resetButton: { marginLeft: "10px", padding: "10px 20px", backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "5px", cursor: "pointer" },

  coursesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" },
  courseCard: { background: "#eef2ff", padding: "20px", borderRadius: "10px", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" },
  courseInfo: {},
  courseTitle: { fontSize: "18px", fontWeight: "bold" },
  instructor: { fontSize: "14px", color: "#555" },
  button: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },

  paginationBar: { width: "100%", maxWidth: 1000, marginTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  pageInfoRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, opacity: 0.85 },
  dot: { opacity: 0.5 },

  pageControls: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" },
  navBtn: {
    display: "grid",
    placeItems: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1px solid #d0d5ff",
    background: "#fff",
    color: "#1e3a8a",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
  pageNumbersWrap: { display: "flex", alignItems: "center", gap: 6, padding: "0 6px" },
  pagePill: {
    minWidth: 38,
    height: 38,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid #d0d5ff",
    background: "#fff",
    color: "#1e3a8a",
    cursor: "pointer",
    fontWeight: 600,
  },
  pagePillActive: {
    minWidth: 38,
    height: 38,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid #1e3a8a",
    background: "#1e3a8a",
    color: "#fff",
    cursor: "default",
    fontWeight: 700,
  },
  ellipsis: { padding: "0 6px", userSelect: "none", opacity: 0.6 },
};

export default CoursesList;