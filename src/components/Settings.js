import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Check, UserCircle } from "lucide-react";
import Sidebar from './Sidebar'; 

const Settings = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('userData')) || {
    username: "Filip", 
    role: "student",
    email: "filip@gmail.com",
    ime: "Filip",
    prezime: "Kostić"
  };

  const [formData, setFormData] = useState({
    firstName: user.ime,
    lastName: user.prezime,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Podaci su sačuvani!");
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
        <Sidebar />

      <div style={styles.mainContent}>
        <h2 style={styles.mainTitle}>Vaš nalog</h2>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <UserCircle size={20} className="input-icon" />
            <input
              type="text"
              name="firstName"
              placeholder="Ime"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <User size={20} className="input-icon" />
            <input
              type="text"
              name="lastName"
              placeholder="Prezime"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <User size={20} className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Korisničko ime"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Mail size={20} className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <User size={20} className="input-icon" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="student">Student</option>
              <option value="teacher">Nastavnik</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" style={styles.submitButton}>
            <Check size={20} className="btn-icon" /> Potvrdite
          </button>
        </form>
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
  mainTitle: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "30px",
  },
  form: {
    width: "100%",
    maxWidth: "600px",
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  input: {
    flex: 1,
    padding: "10px",
    marginLeft: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
  },
  select: {
    flex: 1,
    padding: "10px",
    marginLeft: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
  },
  submitButton: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
  }
};

export default Settings;
