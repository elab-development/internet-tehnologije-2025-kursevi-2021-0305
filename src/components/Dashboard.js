import React from "react";
import Sidebar from "./Sidebar"; // Add this line to import the Sidebar component
import { FaBookOpen, FaLaptop, FaUserGraduate, FaChartLine } from "react-icons/fa"; // Import icons
//import useTitle from "./UseTitle"; // Ispravan import



const Dashboard = () => {
  //useTitle("Dashboard"); // Postavlja naslov stranice
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.dashboardContent}>
          <h1 style={styles.title}>
            Dobrodošli u <span style={styles.highlight}>eLearn</span>!
          </h1>
          <p style={styles.subtitle}>
            <i>Najbolja platforma za online učenje i napredak.</i>
          </p>
          <div style={styles.infoSection}>
            <div style={styles.infoBox}>
              <FaBookOpen style={styles.icon} />
              <h3>Pristupite besplatnim kursevima</h3>
              <p>
                Svi naši kursevi su u potpunosti besplatni i dostupni svima.  
                Učite u svom tempu kroz interaktivne video lekcije i edukativne materijale  
                koji će vam pomoći da proširite svoja znanja.
              </p>
            </div>
            <div style={styles.infoBox}>
              <FaLaptop style={styles.icon} />
              <h3>Učite bilo gde</h3>
              <p>
                Pristup kursevima je moguć sa bilo kog uređaja – računara,  
                tableta ili telefona. Sve što vam je potrebno je internet konekcija.  
                Učenje nikada nije bilo lakše!
              </p>
            </div>
            <div style={styles.infoBox}>
              <FaUserGraduate style={styles.icon} />
              <h3>Osvojite sertifikate</h3>
              <p>
                Po završetku kursa i gledanju svih video lekcija,  
                automatski dobijate sertifikat koji možete koristiti za unapređenje  
                svoje karijere ili dalje obrazovanje.
              </p>
            </div>
            <div style={styles.infoBox}>
              <FaChartLine style={styles.icon} />
              <h3>Praćenje napretka</h3>
              <p>
                Pratite svoj napredak kroz kurseve i vidite koliko vam je  
                ostalo do završetka. Obeležavajte završene lekcije i učite bez stresa!
              </p>
            </div>
          </div>
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
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f7fc",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "100vh",
  },
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
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "10px",
  },
  highlight: {
    color: "#ff9800",
  },
  subtitle: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "30px",
  },
  infoSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  infoBox: {
    background: "#eef2ff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    transition: "transform 0.3s ease",
  },
  icon: {
    fontSize: "40px",
    color: "#1e3a8a",
    marginBottom: "10px",
  },
  footer: {
    textAlign: "center",
    background: "#1e3a8a",
    color: "white",
    width: "100%",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    marginTop: "20px",
    padding: "10px",
    fontSize: "14px",
  },
};

export default Dashboard;