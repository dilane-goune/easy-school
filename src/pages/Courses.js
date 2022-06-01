/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Container, Grid, Box } from "@mui/material";
import FilterLine from "../components/FilterLine.js";
import PageHeader from "../components/PageHeader";
import { useLocation } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";

export default function Courses() {
    const { pathname } = useLocation();

    const [courses, setCourses] = useState([]);

    const {
        feedBack,
        appState: { user },
    } = React.useContext(globalContext);

    React.useEffect(() => {
        fetchData(`/api/courses/${user.isTeacher ? "" : user.classId}`).then(
            (data) => {
                if (data instanceof Array) {
                    setCourses(data);
                } else feedBack("Failed to fetch data");
            }
        );
    }, []);

    return (
        <Container>
            <PageHeader title="Courses" noSearch />
            <FilterLine options={["This year", "All", "Terminated", "Exams"]} />
            <Box>
                <Grid container spacing={{ xs: 0.5, lg: 2 }}>
                    {courses.map((opt, ind) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            xl={2}
                            key={ind}
                        >
                            <CourseCard
                                {...opt}
                                year={new Date().getFullYear()}
                                link={
                                    pathname +
                                    "/" +
                                    opt.courseCode +
                                    "/" +
                                    opt.classId +
                                    "/" +
                                    opt.teacherId
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}
