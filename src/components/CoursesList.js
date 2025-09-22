import React, { useContext } from "react";
import { FaBookOpen } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";

const sampleCourses = [
  {
    id: 1,
    name: "Osnove Programiranja",
    description: "Naučite osnove programiranja kroz praktične primere.",
    image: "https://source.unsplash.com/300x200/?programming",
  },
  {
    id: 2,
    name: "Web Development",
    description: "Postanite stručnjak za frontend i backend web razvoj.",
    image: "https://source.unsplash.com/300x200/?web",
  },
  {
    id: 3,
    name: "Baze Podataka",
    description: "Naučite kako da dizajnirate i upravljate bazama podataka.",
    image: "https://source.unsplash.com/300x200/?database",
  },
  {
    id: 4,
    name: "Veštačka Inteligencija",
    description: "Upoznajte principe i algoritme veštačke inteligencije.",
    image: "https://source.unsplash.com/300x200/?ai",
  },
];

const CoursesList = () => {
  const { user } = useContext(AuthContext);
  const courses = sampleCourses;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <h2 style={styles.title}>
          {user.role === "student" ? "Moji Kursevi" : "Kursevi koje predajem"}
        </h2>
        <div style={styles.courseList}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} style={styles.courseCard}>
                <FaBookOpen style={styles.icon} />
                <h3>{course.name}</h3>
                <p>{course.description}</p>
              </div>
            ))
          ) : (
            <p>Nema dostupnih kurseva.</p>
          )}
        </div>
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
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "20px",
  },
  courseList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    width: "80%",
    maxWidth: "1000px",
  },
  courseCard: {
    background: "#eef2ff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "250px",
    transition: "transform 0.3s ease",
  },
  icon: {
    fontSize: "40px",
    color: "#1e3a8a",
    marginBottom: "10px",
  },
};

export default CoursesList;