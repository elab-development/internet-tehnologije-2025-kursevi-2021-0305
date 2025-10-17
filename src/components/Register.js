import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // koristimo direktno axios; možeš da zameniš sa svojom api instancom

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

  const [errors, setErrors] = useState({
    password: "",
    api: null,   // ovde ćemo ubaciti poruke sa backenda (422)
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" && value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Lozinka mora imati bar 6 karaktera!" }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, api: null }));

    if (formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Lozinka mora imati bar 6 karaktera!" }));
      return;
    }
    if (!formData.agreeToTerms) return;

    // Laravel očekuje: name, email, password, role
    const nameFromForm =
      `${formData.firstName} ${formData.lastName}`.trim() || formData.username;

    const payload = {
      name: nameFromForm,
      email: formData.email,
      password: formData.password,
      role: formData.role, // student | teacher | admin
    };

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/register", payload);
      // Backend vraća samo message (201). Pošto nema tokena/user-a, vodimo na login.
      alert("Uspešna registracija! Prijavite se.");
      navigate("/");
    } catch (err) {
      // Laravel validation: 422 i { errors: { field: [poruke...] } }
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data?.errors || {};
        // spoji sve poruke u jedan string za alert / prikaz
        const firstMsg =
          Object.values(laravelErrors)?.[0]?.[0] || "Greška pri registraciji.";
        setErrors((prev) => ({ ...prev, api: firstMsg }));
      } else {
        setErrors((prev) => ({ ...prev, api: "Došlo je do greške. Pokušajte ponovo." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Registracija</h2>

        {errors.api && (
          <div style={styles.apiErrorBox}>
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="firstName"
            placeholder="Ime"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Prezime"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="username"
            placeholder="Korisničko ime (opciono)"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Lozinka"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.password && <p style={styles.errorText}>{errors.password}</p>}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="student">Student</option>
            <option value="teacher">Nastavnik</option>
            <option value="admin">Administrator</option>
          </select>

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label style={{ marginLeft: 8 }}>Registrujem se u eLearn</label>
          </div>

          <button
            type="submit"
            disabled={!formData.agreeToTerms || loading}
            style={styles.button}
          >
            {loading ? "Kreiram nalog..." : "Registracija"}
          </button>
        </form>

        <button onClick={() => navigate("/")} style={styles.linkButton}>
          Već imate nalog? Prijavite se
        </button>
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
  form: { display: "flex", flexDirection: "column" },
  input: {
    margin: "12px 0",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  errorText: { color: "red", fontSize: "12px", marginBottom: "10px" },
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
  apiErrorBox: {
    background: "#ffecec",
    color: "#b10000",
    border: "1px solid #ffb3b3",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "10px",
    textAlign: "left",
    fontSize: "14px",
  },
};

export default Register;
