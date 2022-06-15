import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import "../styles/main.css";

function Root() {
    const options = [
        { link: "login", label: "Login" },
        { link: "registration", label: "Registration" },
        { link: "help", label: "Help" },
        { link: "about", label: "About" },
    ];

    return (
        <main className="home-page">
            <Container sx={{ mt: { md: "20px" } }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        textAlign: {
                            xs: "center",
                            lg: "left",
                        },
                        "& *": {
                            my: "auto",
                        },
                    }}
                >
                    <Typography variant="h3" fontWeight="medium">
                        Easy School
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "row", md: "row" },
                            justifyContent: "space-evenly",
                            flex: 1,
                        }}
                    >
                        {options.map((opt, ind) => (
                            <Button
                                key={ind}
                                href={opt.link}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderRadius: "20px",
                                }}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </Box>
                </Box>
                <br />
                <Typography variant="h6" sx={{ textAlign: { md: "left" } }}>
                    Easy School is an online an automated application for
                    managing a university activities.
                </Typography>
                <br />
                <Typography>What can Easy School do ?</Typography>
                <div className="root-features">
                    <ul>
                        <li>
                            Students registrations with verifications of
                            required documents and informations
                        </li>
                        <li>
                            Online classes bases on well establish time-tables
                        </li>
                        <li>Automated online exams</li>
                        <li>Academic progress tracking</li>
                        <li>
                            Courses, classes, students and teachers managent by
                            the administration
                        </li>
                        <li>Reports and notes generation</li>
                        <li>Adminitration activities</li>
                        <li>Much more ...</li>
                    </ul>
                </div>
            </Container>
        </main>
    );
}

export default Root;
