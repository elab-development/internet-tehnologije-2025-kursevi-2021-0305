import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    role: "student",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({ password: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "password" && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Lozinka mora imati bar 6 karaktera!" }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      alert("Lozinka mora imati bar 6 karaktera!");
      return;
    }
    localStorage.setItem("userRole", formData.role);
    alert("Uspešna registracija!");
    navigate("/account");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Registracija</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="firstName" placeholder="Ime" value={formData.firstName} onChange={handleChange} required style={styles.input} />
          <input type="text" name="lastName" placeholder="Prezime" value={formData.lastName} onChange={handleChange} required style={styles.input} />
          <input type="text" name="username" placeholder="Korisničko ime" value={formData.username} onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Lozinka" value={formData.password} onChange={handleChange} required style={styles.input} />
          {errors.password && <p style={styles.errorText}>{errors.password}</p>}
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
          <select name="role" value={formData.role} onChange={handleChange} required style={styles.input}>
            <option value="student">Student</option>
            <option value="teacher">Nastavnik</option>
            <option value="admin">Administrator</option>
          </select>
          <div style={styles.checkboxContainer}>
            <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
            <label>Registrujem se u eLearn</label>
          </div>
          <button type="submit" disabled={!formData.agreeToTerms} style={styles.button}>Registracija</button>
        </form>
        <button onClick={() => navigate("/")} style={styles.linkButton}>Već imate nalog? Prijavite se</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f7f7f7",
  },
  card: {
    width: "350px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    margin: "12px 0",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  errorText: {
    color: "red",
    fontSize: "12px",
    marginBottom: "10px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px 0",
  },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
    marginTop: "15px",
  },
};

export default Register;