import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import useAuth from "../hooks/useAuth"; 
import { FaHome, FaBook, FaUserGraduate, FaCog, FaSignOutAlt, FaUserCircle, FaChalkboardTeacher, FaUsersCog, FaAward, FaPlusCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    const { logout } = useAuth(); 
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();  // Dodato za praćenje aktivne stranice

    if (!user) return null; 

    const handleLogout = () => {
        logout();
        navigate("/"); 
    };

    return (
        <div style={styles.sidebar} className="sidebar">
            <h2 style={styles.logo}>eLearn</h2>
            <div style={styles.userSection}>
                {user.role === "admin" && <FaUserCircle style={styles.profileIcon} />}
                {user.role === "teacher" && <FaChalkboardTeacher style={styles.profileIcon} />}
                {user.role === "student" && <FaUserGraduate style={styles.profileIcon} />}
                <h2 style={styles.userName}>Dobrodošli, {user.username}!</h2>
            </div>
            <ul style={styles.menu}>
                <li 
                    onClick={() => navigate("/dashboard")} 
                    className={location.pathname === "/dashboard" ? "active" : ""}
                    style={styles.menuItem}
                >
                    <FaHome /> Početna
                </li>
                <li 
                    onClick={() => navigate("/courses")} 
                    className={location.pathname === "/courses" ? "active" : ""}
                    style={styles.menuItem}
                >
                    <FaBook /> Kursevi
                </li>
                {user.role === "admin" && (
                    <li
                        onClick={() => navigate("/all-users")}
                        className={location.pathname === "/all-users" ? "active" : ""}
                        style={styles.menuItem} 
                    >
                        <FaUsersCog /> Upravljanje korisnicima
                    </li>
                )}
                {user.role === "teacher" && (
                    <li 
                        onClick={() => navigate("/courses-list")} 
                        className={location.pathname === "/courses-list" ? "active" : ""}
                        style={styles.menuItem}
                    >
                        <FaChalkboardTeacher /> Moji kursevi
                    </li>
                )}
                {user.role === "student" && (
                    <li 
                        onClick={() => navigate("/courses-list")} 
                        className={location.pathname === "/courses-list" ? "active" : ""}
                        style={styles.menuItem}
                    >
                        <FaUserGraduate /> Moji časovi
                    </li>
                )}
                {user.role === "student" && (
                    <li 
                        onClick={() => navigate("/certificates")} 
                        className={location.pathname === "/certificates" ? "active" : ""}
                        style={styles.menuItem}
                    >
                        <FaAward /> Moji sertifikati
                    </li>
                )}
                {user.role === "teacher" && (
                    <li 
                        onClick={() => navigate("/add-course")} 
                        className={location.pathname === "/add-course" ? "active" : ""}
                        style={styles.menuItem}
                    >
                        <FaPlusCircle /> Dodaj kurs
                    </li>
                )}
                <li style={styles.menuItem} 
                    onClick={() => navigate("/settings")}
                    className={location.pathname === "/settings" ? "active" : ""}>
                    <FaCog /> Podešavanja
                </li>
                <li onClick={handleLogout} style={styles.menuItem}>
                    <FaSignOutAlt /> Odjava
                </li>
            </ul>
        </div>
    );
};

const styles = {
    sidebar: {
        width: "250px",
        background: "#1e3a8a",
        color: "white",
        padding: "20px",
        borderTopRightRadius: "15px",
        borderBottomRightRadius: "15px",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
    },
    logo: {
        fontSize: "24px",
        marginBottom: "20px",
        fontWeight: "bold",
        textAlign: "center",
    },
    userSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "20px",
    },
    profileIcon: {
        fontSize: "50px",
        marginBottom: "10px",
    },
    userName: {
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center",
    },
    menu: {
        listStyleType: "none",
        padding: 0,
    },
    menuItem: {
        padding: "10px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.3s",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
};

export default Sidebar;