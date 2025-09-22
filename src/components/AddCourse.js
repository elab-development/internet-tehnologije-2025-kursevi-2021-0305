import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaFileUpload, FaTimes } from "react-icons/fa";

const AddCourse = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    materials: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCourseData({
      ...courseData,
      materials: [...courseData.materials, ...files],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Novi kurs:", courseData);
    // Dodaj logiku za slanje podataka na server
  };

  const handleRemoveFile = (fileName) => {
    setCourseData({
      ...courseData,
      materials: courseData.materials.filter((file) => file.name !== fileName),
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dodaj novi kurs</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Naziv kursa:</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            style={styles.input}
            required
            placeholder="Unesite naziv kursa"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Opis kursa:</label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            style={styles.textarea}
            required
            placeholder="Unesite opis kursa"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Materijali kursa:</label>
          <div style={styles.fileInputWrapper}>
            <input type="file" onChange={handleFileChange} multiple style={styles.inputFile} />
            <FaFileUpload style={styles.uploadIcon} />
          </div>
          <div style={styles.materialList}>
            {courseData.materials.map((file, index) => (
              <div key={index} style={styles.materialItem}>
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.name)}
                  style={styles.removeButton}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.submitButton}>
            <FaPlusCircle style={styles.icon} /> Dodaj kurs
          </button>
          <button type="button" style={styles.cancelButton} onClick={() => navigate("/dashboard")}>
            <FaTimes style={styles.icon} /> Odustani
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: "80%",
    maxWidth: "850px",
    margin: "0 auto",
    padding: "40px",
    background: "linear-gradient(135deg, #58a6ff, #d1e8ff)",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "30px",
    fontWeight: "600",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#444",
  },
  input: {
    padding: "14px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    color: "#333",
  },
  textarea: {
    padding: "14px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    minHeight: "150px",
  },
  fileInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadIcon: {
    fontSize: "22px",
    color: "#58a6ff",
    cursor: "pointer",
    transition: "color 0.3s",
  },
  materialList: {
    marginTop: "15px",
  },
  materialItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f4f7fc",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "8px",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#ff0000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "18px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  submitButton: {
    padding: "14px 20px",
    background: "#58a6ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out, transform 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cancelButton: {
    padding: "14px 20px",
    background: "#888",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out, transform 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "22px",
  },
};

export default AddCourse;