import React from "react";
import { Container, Typography, Grid, Box } from "@mui/material";
import HomeCard from "../components/HomeCard";
import globalContext from "../context/globalContext";

const homeOptions = [
    {
        "link": "/profile",
        "label": "Profile",
        "image": require("../assets/images/profile-picture.png"),
    },
    {
        "link": "/courses",
        "label": "My Courses",
        "image": require("../assets/images/courses.jpg"),
    },
    {
        "link": "/questions",
        "label": "Questions",
        "image": require("../assets/images/questions.jpg"),
    },
    {
        "link": "/exams",
        "label": "Exams",
        "image": require("../assets/images/exams.jpg"),
    },
    {
        "link": "/time-tables",
        "label": "Time Table",
        "image": require("../assets/images/time-table.webp"),
    },
    {
        "link": "/announcements",
        "label": "Announcements",
        "image": require("../assets/images/announcement.jpg"),
    },
    {
        "link": "/admin/registrations",
        "label": "Registrations",
        "image": require("../assets/images/registrations.jpg"),
        "isAdmin": true,
    },
    {
        "link": "/admin/courses",
        "label": "Courses",
        "image": require("../assets/images/courses.jpg"),
        "isAdmin": true,
    },
    {
        "link": "/admin/classes",
        "label": "Classes",
        "image": require("../assets/images/classes.png"),
        "isAdmin": true,
    },
    {
        "link": "/admin/teachers",
        "label": "Teachers",
        "image": require("../assets/images/teachers.jpg"),
        "isAdmin": true,
    },
    {
        "link": "/admin/specializations",
        "label": "Specializations",
        "image": require("../assets/images/specializations.jpeg"),
        "isAdmin": true,
    },
];

function Home() {
    const {
        appState: {
            user: { isAdmin },
        },
    } = React.useContext(globalContext);

    return (
        <Container>
            <Box
                marginY={"5px"}
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
            >
                <Typography
                    variant="h5"
                    fontWeight="500"
                    gutterBottom
                    component="div"
                >
                    Home
                </Typography>
            </Box>
            <Grid container spacing={2}>
                {isAdmin
                    ? homeOptions.map((img, ind) => (
                          <Grid item sm={6} xs={12} md={3} xl={4} key={ind}>
                              <HomeCard
                                  label={img.label}
                                  image={img.image}
                                  link={img.link}
                              />
                          </Grid>
                      ))
                    : homeOptions
                          .filter((opt) => !opt.isAdmin)
                          .map((img, ind) => (
                              <Grid item sm={6} xs={12} md={3} xl={4} key={ind}>
                                  <HomeCard
                                      label={img.label}
                                      image={img.image}
                                      link={img.link}
                                  />
                              </Grid>
                          ))}
            </Grid>
        </Container>
    );
}

export default Home;
