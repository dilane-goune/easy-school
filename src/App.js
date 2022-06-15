import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./functions/socket.io";
// user
import Root from "./pages/Root";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";

import ErrorPage from "./pages/ErrorPage";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";

import globalContext from "./context/globalContext";
import MySnackBar from "./components/MySnackBar";
import Registrations from "./pages/admin/Registrations";
import RegistrationStudent from "./pages/admin/RegistrationStudent";
import FinishRegistration from "./pages/FinishRegistration";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminTeachers from "./pages/admin/AdminTeachers";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import NavBar from "./components/NavBar";
import Exams from "./pages/Exams";
import NewExam from "./pages/NewExam";
import Questions from "./pages/Questions";
import { getNotifications, writeNotifications } from "./functions/notification";
import socket from "./functions/socket.io";
import TimeTables from "./pages/TimeTables";
import NewTimeTable from "./pages/NewTimeTable";
import WriteExam from "./pages/WriteExam";
import ExamResult from "./pages/ExamResult";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import Specializations from "./pages/admin/Specializations";
import TeacherOnlineClass from "./pages/TeacherOnlineClass";
import StudentOnlineClass from "./pages/StudentOnlineClass";
import GetPasswordRecoveryCode from "./pages/GetPasswordRecoveryCode";
import ConfirmPasswordRecoveryCode from "./pages/ConfirmPasswordRecoveryCode";

let sessionUser = sessionStorage.getItem("user");
if (sessionUser) sessionUser = JSON.parse(sessionUser);
else sessionUser = {};

let token = sessionStorage.getItem("token");
if (token) token = JSON.parse(token);

function App() {
    const reducer = (state, action) => {
        if (action.type === "SHOW_SNACK_BAR") {
            return {
                ...state,
                showSnackBar: true,
                snackBarMessage: action.snackBarMessage,
                snackBarSeverity:
                    action.snackBarSeverity || state.snackBarSeverity,
            };
        }
        if (action.type === "CLOSE_SNACK_BAR") {
            return { ...state, showSnackBar: false };
        }
        if (action.type === "SET_USER") {
            return { ...state, user: action.user };
        }
        if (action.type === "SET_TOKEN") {
            return { ...state, token: action.token };
        }
        console.log("wrong action => ", action);
        throw new Error("no dispacth match");
    };

    const initialState = {
        showSnackBar: false,
        snackBarMessage: "",
        snackBarSeverity: "error",
        user: sessionUser,
        token,
    };

    const [appState, dispatchApp] = React.useReducer(reducer, initialState);

    const [notifications, setNotifications] = React.useState(
        getNotifications()
    );

    const socketRef = React.useRef();

    React.useEffect(() => {
        const addNotifications = (newNotifications) => {
            setNotifications([
                ...new Set(notifications.concat(newNotifications)),
            ]);
            writeNotifications([
                ...new Set(notifications.concat(newNotifications)),
            ]);
        };

        socket.on("notifications", addNotifications);

        socket.on("exam-start", ({ examName, examId }) => {
            addNotifications({
                primary: `The exam of ${examName} has started.`,
                date: new Date().toISOString(),
                link: "/exams",
                read: false,
            });
        });

        socketRef.current = socket;
    }, [notifications]);

    function feedBack(message, severity = "error") {
        dispatchApp({
            type: "SHOW_SNACK_BAR",
            snackBarMessage: message,
            snackBarSeverity: severity,
        });
    }

    return (
        <globalContext.Provider
            value={{
                feedBack,
                appState,
                dispatchApp,
                notifications,
                socketRef,
                setNotifications,
            }}
        >
            <BrowserRouter>
                <Routes>
                    {/* user */}
                    <Route path="/">
                        <Route path="" element={<Root />}></Route>
                        <Route path="login" element={<Login />}></Route>
                        <Route
                            path="registration"
                            element={<Registration />}
                        ></Route>
                        <Route path="admin" element={<Root />}></Route>
                        <Route path="admin/login" element={<Login />}></Route>

                        <Route
                            path="courses/host-online/:classId"
                            element={<TeacherOnlineClass />}
                        ></Route>
                        <Route
                            path="courses/online/:classId/:teacherId"
                            element={<StudentOnlineClass />}
                        ></Route>

                        <Route
                            element={
                                <>
                                    <NavBar />
                                </>
                            }
                        >
                            <Route path="home" element={<Home />}></Route>

                            <Route
                                path="finish-registration/:userId"
                                element={<FinishRegistration />}
                            ></Route>
                            <Route path="courses" element={<Courses />}></Route>
                            <Route
                                path="courses/:courseCode/:classId/:teacherId"
                                element={<Course />}
                            ></Route>

                            <Route path="exams" element={<Exams />}></Route>
                            <Route
                                path="exams/write/:examId"
                                element={<WriteExam />}
                            ></Route>
                            <Route
                                path="exams/result/:examId"
                                element={<ExamResult />}
                            ></Route>
                            <Route
                                path="exams/new-exam/:courseCode/:classId"
                                element={<NewExam />}
                            ></Route>
                            <Route
                                path="questions"
                                element={<Questions />}
                            ></Route>
                            <Route
                                path="time-tables"
                                element={<TimeTables />}
                            ></Route>
                            <Route
                                path="time-tables/new-time-table"
                                element={<NewTimeTable />}
                            ></Route>
                            <Route path="profile" element={<Profile />}></Route>
                            <Route
                                path="announcements"
                                element={<Announcements />}
                            ></Route>

                            {/* admin */}
                            <Route path="/admin">
                                <Route path="home" element={<Home />}></Route>

                                <Route
                                    path="registrations"
                                    element={<Registrations />}
                                ></Route>
                                <Route
                                    path="registrations/:id"
                                    element={<RegistrationStudent />}
                                ></Route>
                                <Route
                                    path="courses"
                                    element={<AdminCourses />}
                                ></Route>

                                <Route
                                    path="classes"
                                    element={<AdminClasses />}
                                ></Route>
                                <Route
                                    path="teachers"
                                    element={<AdminTeachers />}
                                ></Route>
                                <Route
                                    path="specializations"
                                    element={<Specializations />}
                                ></Route>
                                <Route
                                    path="announcements"
                                    element={<Announcements />}
                                ></Route>
                            </Route>
                        </Route>
                    </Route>

                    <Route
                        path="/get-recovery-code/"
                        element={<GetPasswordRecoveryCode />}
                    ></Route>
                    <Route
                        path="/confirm-recovery-code/:code/"
                        element={<ConfirmPasswordRecoveryCode />}
                    ></Route>
                    <Route path="/help" element={<HelpPage />}></Route>
                    <Route path="/about" element={<AboutPage />}></Route>
                    <Route
                        path="/service-error"
                        element={<ErrorPage />}
                    ></Route>
                    <Route path="*" element={<ErrorPage />}></Route>
                </Routes>
            </BrowserRouter>
            <MySnackBar
                open={appState.showSnackBar}
                message={appState.snackBarMessage}
                onClose={() => {
                    dispatchApp({ type: "CLOSE_SNACK_BAR" });
                }}
                severity={appState.snackBarSeverity}
            />
        </globalContext.Provider>
    );
}

export default App;
