import React from "react";
import { Container, Typography } from "@mui/material";
import RootHeader from "../components/RootHeader";
import "../styles/main.css";

function Root() {
    return (
        <main className="home-page">
            <Container sx={{ mt: { md: "20px" } }}>
                <RootHeader user="student" />
                <br />
                <Typography
                    variant="h6"
                    sx={{ textAlign: { xs: "center", md: "left" } }}
                >
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
