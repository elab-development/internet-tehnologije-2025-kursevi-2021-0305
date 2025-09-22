import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);  // Dodaj loading stanje
  const [error, setError] = useState(null);  // Dodaj stanje za greške

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users");

      if (!response.ok) {
        throw new Error("API greška: " + response.statusText);
      }

      const data = await response.json();
      console.log('API odgovor:', data); // Logovanje odgovora

      if (Array.isArray(data.data)) {
        setUsers(data.data); // Postavljanje korisnika u stanje
      } else {
        console.error("Podaci nisu niz:", data);
        setError("Podaci nisu u očekivanom formatu.");
      }
    } catch (error) {
      console.error("Greška prilikom učitavanja korisnika:", error);
      setError("Greška prilikom učitavanja korisnika.");
    } finally {
      setLoading(false);  // Kada se podaci učitaju ili nastane greška, postaviti loading na false
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <h2 style={styles.title}>Prikaz svih korisnika</h2>
        {loading && <p>Učitavanje...</p>}  
        {error && <p>{error}</p>} 
        {!loading && !error && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Ime</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Uloga</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.tableCell}>{user.name}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f7fc",
  },
  mainContent: {
    flex: 1,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "30px",
  },
  table: {
    width: "100%",
    maxWidth: "1000px",
    borderCollapse: "collapse",
    background: "white",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#374151",
    padding: "12px",
    borderBottom: "2px solid #ddd",
  },
  tableCell: {
    fontSize: "16px",
    color: "#4b5563",
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  }
};

export default AllUsers;