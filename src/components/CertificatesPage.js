import React from "react";
import Sidebar from "./Sidebar"; // Adjust the path as necessary

const CertificatesPage = () => {
  const certificates = [
    { title: "Osnovni kurs React.js", date: "Jan 2025", issuer: "eLearn Platforma" },
    { title: "Napredni kurs JavaScript-a", date: "Feb 2025", issuer: "eLearn Platforma" },
    { title: "Kurs za razvoj aplikacija", date: "Mar 2025", issuer: "eLearn Platforma" },
    // Dodajte još sertifikata po potrebi
  ];

  return (
    <div style={styles.container}>
      <Sidebar></Sidebar>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Moji sertifikati</h2>
        <div style={styles.certificateList}>
          {certificates.map((certificate, index) => (
            <div key={index} style={styles.certificateItem}>
              <h3 style={styles.certificateTitle}>{certificate.title}</h3>
              <p style={styles.certificateDetails}>
                Izdato: {certificate.date} | Izdavač: {certificate.issuer}
              </p>
            </div>
          ))}
        </div>
        <footer style={styles.footer}>
          <p>&copy; {new Date().getFullYear()} eLearn. Sva prava zadržana.</p>
        </footer>
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
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  certificateList: {
    width: "80%",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  certificateItem: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  certificateTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
  },
  certificateDetails: {
    fontSize: "16px",
    color: "#555",
    marginTop: "5px",
  },
  footer: {
    textAlign: "center",
    background: "#1e3a8a",
    color: "white",
    width: "100%",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    marginTop: "20px",
    padding: "2px",
    fontSize: "12px",
  },
};

export default CertificatesPage;