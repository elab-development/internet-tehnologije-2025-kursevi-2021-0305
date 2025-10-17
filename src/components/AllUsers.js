import React, { useEffect, useMemo, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import api from "../api/api-client";
import { AuthContext } from "../context/AuthContext";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

const PER_PAGE_DEFAULT = 10;

const AllUsers = () => {
  const { user: me } = useContext(AuthContext); // zaštita da ne briše sebe + front guard
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state (paginacija + pretraga + per_page)
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const perPageFromUrl = parseInt(
    searchParams.get("per_page") || String(PER_PAGE_DEFAULT),
    10
  );
  const qFromUrl = searchParams.get("q") || "";

  // UI state
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState(qFromUrl);
  const [perPage, setPerPage] = useState(perPageFromUrl);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async (page, perPageVal, qVal) => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(perPageVal));
      if (qVal) params.set("q", qVal);

      const { data } = await api.get(`/users?${params.toString()}`);

      // lista (Resource::collection => data.data; raw => data)
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setUsers(list);

      // meta normalizacija
      let m =
        data?.meta ??
        (typeof data?.current_page !== "undefined"
          ? {
              current_page: Number(data.current_page) || page,
              last_page: Number(data.last_page) || 1,
              per_page: Number(data.per_page) || perPageVal,
              total: Number(data.total) || list.length,
              has_prev: !!data.prev_page_url,
              has_next: !!data.next_page_url,
            }
          : null);

      if (!m) {
        m = {
          current_page: page,
          last_page: 1,
          per_page: perPageVal,
          total: list.length,
          has_prev: false,
          has_next: false,
        };
      }
      setMeta(m);
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message || e?.message || "Greška pri učitavanju korisnika.";
      setErr(`Greška (${status ?? "—"}): ${msg}`);
      console.error("GET /users error:", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pageFromUrl, perPageFromUrl, qFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl, perPageFromUrl, qFromUrl]);

  const filtered = useMemo(() => users, [users]); // server-side filtriranje; ovde ne filtriramo

  const goToPage = (p) => {
    const last = meta?.last_page || 1;
    const clamped = Math.max(1, Math.min(p, last));
    setSearchParams({
      page: String(clamped),
      per_page: String(perPage),
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
      q: q ? q : "",
    });
  };

  const applySearch = (e) => {
    e?.preventDefault?.();
    setSearchParams({
      page: "1",
      per_page: String(perPage),
      q: q ? q : "",
    });
  };

  const deleteUser = async (id) => {
    if (me?.id === id) {
      alert("Ne možete obrisati sopstveni nalog.");
      return;
    }
    const ok = window.confirm("Da li sigurno želiš da obrišeš ovog korisnika?");
    if (!ok) return;

    setDeletingId(id);
    setErr(null);
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // nakon brisanja, ako je prazna stranica (osim prve), idi korak unazad
      if (users.length === 1 && (meta?.current_page || 1) > 1) {
        goToPage((meta?.current_page || 1) - 1);
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message || e?.message || "Greška pri brisanju korisnika.";
      setErr(`Greška (${status ?? "—"}): ${msg}`);
      console.error("DELETE /users/:id error:", e?.response?.data || e);
    } finally {
      setDeletingId(null);
    }
  };

  // lep prikaz paginacije (pilule + ikone)
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
      if (prev && p - prev > 1) {
        buttons.push(
          <span key={`el-${idx}`} style={styles.ellipsis}>
            …
          </span>
        );
      }
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

  // frontend guard: samo adminu je dostupna strana (backend štiti svakako)
  if (me && me.role !== "admin") {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.mainContent}>
          <h2 style={styles.title}>Upravljanje korisnicima</h2>
          <p>Nemate dozvolu za pristup ovoj stranici.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <h2 style={styles.title}>Upravljanje korisnicima</h2>

        {/* Filter traka: pretraga + per_page + osveži */}
        <form style={styles.toolbar} onSubmit={applySearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraži ime, email ili ulogu…"
            style={styles.search}
          />
          <div style={styles.perPageBox}>
            <label style={{ marginRight: 8 }}>Po stranici:</label>
            <select value={perPage} onChange={changePerPage} style={styles.select}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={styles.refreshBtn}>
            Pretraži
          </button>
        </form>

        {loading && <p>Učitavanje…</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && !err && (
          <div style={{ width: "100%", maxWidth: 1000 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ime</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Uloga</th>
                  <th style={styles.th} width="140">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={badgeStyle(u.role)}>{u.role}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            onClick={() => deleteUser(u.id)}
                            style={styles.btnDanger}
                            disabled={deletingId === u.id || me?.id === u.id}
                            title={
                              me?.id === u.id
                                ? "Ne možete obrisati sopstveni nalog"
                                : "Obriši"
                            }
                          >
                            {deletingId === u.id ? "Brisanje…" : "Obriši"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.td} colSpan={4}>
                      Nema korisnika za prikaz.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginacija */}
            {meta && (meta.last_page > 1 || meta.has_prev || meta.has_next) && (
              <div style={styles.paginationBar}>
                <div style={styles.pageInfoRow}>
                  <span>
                    Stranica <strong>{meta.current_page || 1}</strong> /{" "}
                    {meta.last_page || 1}
                  </span>
                  {typeof meta.total !== "undefined" && (
                    <>
                      <span style={styles.dot}>•</span>
                      <span>Ukupno: {meta.total}</span>
                    </>
                  )}
                </div>

                <div style={styles.pageControls}>
                  <button
                    onClick={() => goToPage(1)}
                    disabled={(meta.current_page || 1) <= 1}
                    style={styles.navBtn}
                    title="Prva"
                  >
                    <FaAngleDoubleLeft />
                  </button>
                  <button
                    onClick={() => goToPage((meta.current_page || 1) - 1)}
                    disabled={
                      meta.has_prev === false
                        ? true
                        : (meta.current_page || 1) <= 1
                    }
                    style={styles.navBtn}
                    title="Prethodna"
                  >
                    <FaAngleLeft />
                  </button>

                  <div style={styles.pageNumbersWrap}>{renderPageButtons()}</div>

                  <button
                    onClick={() => goToPage((meta.current_page || 1) + 1)}
                    disabled={
                      meta.has_next === false
                        ? true
                        : (meta.current_page || 1) >= (meta.last_page || 1)
                    }
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
          </div>
        )}
      </div>
    </div>
  );
};

// značka boje po ulozi
const badgeStyle = (role) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  background:
    role === "admin" ? "#1e3a8a" :
    role === "teacher" ? "#0ea5e9" :
    "#16a34a",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
});

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fc" },
  mainContent: { flex: 1, padding: "40px", display: "flex", flexDirection: "column", alignItems: "center" },
  title: { fontSize: "30px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "18px" },

  // toolbar
  toolbar: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    width: "100%",
    maxWidth: 1000,
    flexWrap: "wrap",
  },
  search: { flex: 1, minWidth: 240, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" },
  perPageBox: { display: "flex", alignItems: "center", gap: 8 },
  select: { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" },
  refreshBtn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d5ff", background: "#fff", color: "#1e3a8a", cursor: "pointer" },

  // tabela
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.08)",
    borderRadius: 12,
    overflow: "hidden",
  },
  th: { textAlign: "left", padding: "12px 14px", borderBottom: "2px solid #e5e7eb", color: "#374151", fontWeight: 700 },
  td: { padding: "12px 14px", borderBottom: "1px solid #e5e7eb", color: "#4b5563", verticalAlign: "middle" },

  // paginacija
  paginationBar: {
    width: "100%",
    maxWidth: 1000,
    marginTop: 22,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  pageInfoRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, opacity: 0.85 },
  dot: { opacity: 0.5 },

  pageControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
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
    fontWeight: 700

  },
  ellipsis: { padding: "0 6px", userSelect: "none", opacity: 0.6 },

  actions: { display: "flex", gap: 8 },
  btnDanger: { padding: "8px 12px", background: "#dc2626", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" },
};

export default AllUsers;