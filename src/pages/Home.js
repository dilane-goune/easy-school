import React from "react";
import {
    Container,
    Typography,
    Grid,
    Box,
    Autocomplete,
    TextField,
} from "@mui/material";
import HomeCard from "../components/HomeCard";
import useIsAdmin from "../functions/useIsAdmin";
import globalContext from "../context/globalContext";

const studentHomeOptions = [
    { link: "user-profile", label: "Profile" },
    {
        link: "/courses",
        label: "Courses",
        image: require("../assets/images/courses.jpg"),
    },
    {
        link: "/exams",
        label: "Exams",
        image: require("../assets/images/exams.jpg"),
    },
    {
        link: "/teachers",
        label: "Teachers",
        image: require("../assets/images/teachers.jpg"),
    },
    {
        link: "/courses/live",
        label: "Live Classes",
        image: require("../assets/images/live.jpg"),
    },
    {
        link: "/time-tables",
        label: "Time Table",
        image: require("../assets/images/time-table.webp"),
    },
    {
        link: "/payments",
        label: "Payments",
        image: require("../assets/images/payments.jpg"),
    },
];
const teacherHomeOptions = [
    { link: "user-profile", label: "Profile" },
    {
        link: "/courses",
        label: "Courses",
        image: require("../assets/images/courses.jpg"),
    },
    {
        link: "/questions",
        label: "Questions",
        image: require("../assets/images/questions.jpg"),
    },
    {
        link: "/exams",
        label: "Exams",
        image: require("../assets/images/exams.jpg"),
    },

    {
        link: "/courses/live",
        label: "Live Classes",
        image: require("../assets/images/live.jpg"),
    },
    {
        link: "/time-tables",
        label: "Time Table",
        image: require("../assets/images/time-table.webp"),
    },
    {
        link: "/payments",
        label: "Payments",
        image: require("../assets/images/payments.jpg"),
    },
];

const adminHomeOptions = [
    { link: "/admin/profile", label: "Profile" },
    {
        link: "/admin/registrations",
        label: "Registrations",
        image: require("../assets/images/registrations.jpg"),
    },
    {
        link: "/admin/courses",
        label: "Courses",
        image: require("../assets/images/courses.jpg"),
    },
    {
        link: "/admin/classes",
        label: "Classes",
        image: require("../assets/images/classes.png"),
    },
    {
        link: "/admin/exams",
        label: "Exams",
        image: require("../assets/images/exams.jpg"),
    },
    {
        link: "/admin/teachers",
        label: "Teachers",
        image: require("../assets/images/teachers.jpg"),
    },

    {
        link: "/admin/payments",
        label: "Payments",
        image: require("../assets/images/payments.jpg"),
    },
];

function Home() {
    const isAdmin = useIsAdmin();
    const {
        appState: {
            user: { isTeacher },
        },
    } = React.useContext(globalContext);
    const homeOptions = isAdmin
        ? adminHomeOptions
        : isTeacher
        ? teacherHomeOptions
        : studentHomeOptions;

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
                    Student User
                </Typography>
                <Autocomplete
                    disablePortal
                    options={[]}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Search" />
                    )}
                    size="small"
                    loading
                />
            </Box>
            <Grid container spacing={2}>
                {homeOptions.map((img, ind) => (
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
