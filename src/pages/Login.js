import React, { useState } from "react";
import "../styles/main.css";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
} from "@mui/material";
import { emailRegEx } from "../functions/regex";
import { Link, useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import Input from "../components/Input";
import useIsAdmin from "../functions/useIsAdmin";
import globalContext from "../context/globalContext";

export default function Login() {
    // state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    // const [rememberMe, setRememberMe] = useState(true);

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const isAdmin = useIsAdmin();

    // functions
    const { feedBack, dispatchApp, socketRef } =
        React.useContext(globalContext);

    async function handleLogin() {
        try {
            setIsLoading(true);
            const body = { password };
            if (isAdmin) body.userName = userName;
            else body.email = email;

            let res = await fetch(isAdmin ? "/api/admin/login" : "/api/login", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (res.status === 401) {
                feedBack("Incorrect password");
                return;
            } else if (res.status === 405) {
                feedBack("Account suspended");
                return;
            } else if (res.status === 403) {
                feedBack(
                    isAdmin
                        ? "Unauthorised"
                        : `There is no user with this email in the system.
                If you have registered. We will send you a confirmation mail
                before you can login.`
                );
                return;
            } else if (res.status === 500) {
                feedBack("Sothing when wrong.");

                return;
            } else if (res.status === 499) {
                const data = await res.json();
                console.log(`/finish-registration/${data.id}`);
                feedBack(
                    <span>
                        You haven't finish your registration. finist it{" "}
                        <a href={`/finish-registration/${data.id}`}>here</a>
                    </span>,
                    "warning"
                );
                return;
            } else if (res.status === 200) {
                const { user, token } = await res.json();

                !isAdmin &&
                    socketRef.current.emit("user-login", {
                        userId: user._id,
                        classId: user.classId,
                        isTeacher: user.isTeacher,
                    });
                sessionStorage.setItem(
                    "user",
                    JSON.stringify({ ...user, isAdmin })
                );
                sessionStorage.setItem("token", JSON.stringify(token));

                dispatchApp({ type: "SET_USER", user: { ...user, isAdmin } });
                dispatchApp({ type: "SET_TOKEN", token });

                navigate(isAdmin ? "/admin/home" : "/home", { replace: true });
            } else feedBack("Sothing when wrong. you are probably offline.");
        } catch (e) {
            console.log(e);
            feedBack("Sothing when wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="home-page">
            <Container>
                {/* <RootHeader current="login" /> */}

                <Typography
                    variant="h4"
                    fontWeight="400"
                    mb="20px"
                    sx={{ py: { md: 2 }, textAlign: "center" }}
                >
                    {isAdmin ? "Login as Admin" : "Login"}
                </Typography>
                <Paper
                    elevation={2}
                    sx={{
                        maxWidth: "700px",
                        minHeight: "480px",
                        mx: { xs: "5px", md: "auto" },
                        py: "10px",
                        my: "20px",
                    }}
                >
                    <Box
                        component="form"
                        autoComplete="off"
                        sx={{
                            maxWidth: { xs: "90%", lg: 500 },
                            mx: "auto",
                            "& > :not(style)": { my: 2 },
                        }}
                    >
                        {isAdmin ? (
                            <Input
                                label="Username"
                                value={userName}
                                onChange={(val) => setUserName(val)}
                                required
                                variant="standard"
                            />
                        ) : (
                            <Input
                                error={!emailRegEx.test(email) && email !== ""}
                                label="Email"
                                value={email}
                                onChange={(val) => setEmail(val)}
                                required
                                variant="standard"
                            />
                        )}

                        {/* <br /> */}
                        <Input
                            label="Password"
                            value={password}
                            onChange={(val) => setPassword(val)}
                            required
                            type="password"
                            variant="standard"
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box></Box>
                            <Button
                                disabled={
                                    isAdmin
                                        ? !userName || !password || isLoading
                                        : !emailRegEx.test(email) ||
                                          !password ||
                                          isLoading
                                }
                                // variant="outlined"
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <LoginIcon />
                                    )
                                }
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        </Box>

                        {!isAdmin && (
                            <React.Fragment>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Don't have an account ? register{" "}
                                    <Link to="/registration">here</Link>
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Forgot password ? recover{" "}
                                    <Link to="/get-recovery-code/student">
                                        here
                                    </Link>
                                </Typography>
                            </React.Fragment>
                        )}
                    </Box>
                </Paper>
            </Container>
        </main>
    );
}
