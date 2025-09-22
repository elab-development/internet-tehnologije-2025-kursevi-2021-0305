import React, { useState } from "react";
import { FaUserGraduate, FaBookOpen, FaCode, FaPaintBrush, FaRobot, FaDatabase, FaReact, FaPython, FaShieldAlt, FaGlobe } from "react-icons/fa";
import Sidebar from "./Sidebar";

const allCourses = [
  { title: "Kompletan JavaScript Kurs 2022", instructor: "Marko Petrović", link: "#", icon: <FaCode /> },
  { title: "Online HTML & CSS kurs", instructor: "Ivana Jovanović", link: "#", icon: <FaGlobe /> },
  { title: "React od nule do heroja", instructor: "Nikola Stojanović", link: "#", icon: <FaReact /> },
  { title: "Python za početnike", instructor: "Ana Milovanović", link: "#", icon: <FaPython /> },
  { title: "Full Stack Web Development", instructor: "Stefan Lazić", link: "#", icon: <FaDatabase /> },
  { title: "Machine Learning", instructor: "Marko Petrović", link: "#", icon: <FaRobot /> },
  { title: "UX/UI Design Masterclass", instructor: "Ivana Jovanović", link: "#", icon: <FaPaintBrush /> },
  { title: "Cyber Security Basics", instructor: "Nikola Stojanović", link: "#", icon: <FaShieldAlt /> }
];

const uniqueInstructors = [...new Set(allCourses.map(course => course.instructor))];

const Courses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 4;
  const [filteredInstructor, setFilteredInstructor] = useState(null);

  const filteredCourses = filteredInstructor
    ? allCourses.filter(course => course.instructor === filteredInstructor)
    : allCourses;

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const nextPage = () => {
    if (indexOfLastCourse < filteredCourses.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleInstructorClick = (instructor) => {
    setFilteredInstructor(instructor);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    setFilteredInstructor(null);
    setCurrentPage(1);
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.dashboardContent}>
          <h1 style={styles.title}><FaBookOpen /> Kursevi</h1>

          {/* Lista nastavnika sa klikabilnim filterima */}
          <div style={styles.instructorsList}>
            {uniqueInstructors.map((instructor, index) => (
              <button
                key={index}
                onClick={() => handleInstructorClick(instructor)}
                style={{
                  ...styles.instructorButton,
                  ...(filteredInstructor === instructor ? styles.activeInstructor : {}),
                }}
              >
                <FaUserGraduate style={styles.instructorIcon} /> {instructor}
              </button>
            ))}
            {filteredInstructor && (
              <button onClick={resetFilter} style={styles.resetButton}>Prikaži sve</button>
            )}
          </div>

          <div style={styles.coursesGrid}>
            {currentCourses.map((course, index) => (
              <div key={index} style={styles.courseCard}>
                <div style={styles.courseInfo}>
                  <h3 style={styles.courseTitle}>
                    {course.icon} {course.title}
                  </h3>
                  <p style={styles.instructor}><FaUserGraduate /> {course.instructor}</p>
                  <a href={course.link} style={styles.button}>Pogledaj kurs</a>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.pagination}>
            <button onClick={prevPage} disabled={currentPage === 1} style={styles.pageButton}>← Prethodna</button>
            <span> Stranica {currentPage} </span>
            <button onClick={nextPage} disabled={indexOfLastCourse >= filteredCourses.length} style={styles.pageButton}>Sledeća →</button>
          </div>
        </div>
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
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "20px",
  },
  instructorsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  instructorButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  activeInstructor: {
    backgroundColor: "#0056b3",
  },
  instructorIcon: {
    marginRight: "8px",
  },
  resetButton: {
    marginLeft: "10px",
    padding: "10px 20px",
    backgroundColor: "#ccc",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  courseCard: {
    background: "#eef2ff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  courseTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  instructor: {
    fontSize: "14px",
    color: "#555",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
  },
  pagination: {
    marginTop: "20px",
  },
  pageButton: {
    margin: "5px",
    padding: "8px 15px",
    border: "none",
    backgroundColor: "#1e3a8a",
    color: "white",
    cursor: "pointer",
    borderRadius: "5px",
  }
};

export default Courses;