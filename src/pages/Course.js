import React from "react";
import {
    Container,
    Typography,
    Grid,
    Box,
    Divider,
    Paper,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import CourseCard from "../components/CourseCard";
import { Link, useParams } from "react-router-dom";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(LocalizedFormat);

export default function Course() {
    const [course, setCourse] = React.useState({});
    const [_class, setClass] = React.useState({});
    const [teacher, setTeacher] = React.useState({});
    const [exams, setExams] = React.useState([]);

    const [isLoading, setIsLoading] = React.useState(true);

    const {
        feedBack,
        appState: {
            user: { isTeacher },
        },
    } = React.useContext(globalContext);
    const { courseCode, classId, teacherId } = useParams();

    React.useEffect(() => {
        fetchData(
            "/api/courses/" + courseCode + "/" + classId + "/" + teacherId
        ).then((data) => {
            if (data instanceof Object) {
                if (data) {
                    setCourse(data.course);
                    setTeacher(data.teacher);
                    setClass(data._class);
                    setExams(data.exams);
                }
            } else feedBack("Failed to fetch data");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff", zIndex: 300 }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    "& .MuiButton-root": { ml: "10px" },
                }}
            >
                <PageHeader title="Course" noSearch />
                {isTeacher && (
                    <Link
                        to={"/exams/new-exam/" + courseCode + "/" + classId}
                        style={{
                            fontFamily: "Roboto",
                            fontSize: "18px",
                            fontWeight: "bold",
                        }}
                    >
                        NEW EXAM
                    </Link>
                )}
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <CourseCard
                            {...{
                                courseCode: course?.courseCode,
                                courseName: course.name,
                                className: _class.name,
                                year: new Date().getFullYear(),
                                courseColor: course.color,
                                fullWidth: true,
                            }}
                            fullWidth
                        />

                        <Box sx={{ md: { px: "20px" } }}>
                            <Typography variant="h5">
                                {course.courseName}
                            </Typography>
                            <Typography variant="body1">
                                {_class.className}
                            </Typography>
                            <Typography variant="body1">
                                credit : {_class.credit}
                            </Typography>
                            <Typography variant="body1">
                                <em>theory </em> : {_class?.time.theory}{" "}
                                <em>hrs</em>, <em>practices </em> :{" "}
                                {_class?.time.practices} <em>hrs</em>,{" "}
                                <em>exercises </em> :{_class?.time.exercises}{" "}
                                <em>hrs</em>
                            </Typography>
                            <Typography display="inline" variant="body1">
                                Teacher :
                            </Typography>
                            <Typography
                                marginLeft="4px"
                                display="inline"
                                variant="h6"
                            >
                                {teacher?.name + " " + teacher?.surName + " "}{" "}
                            </Typography>
                            <em>
                                {teacher?.diplomat &&
                                    "(" + teacher?.diplomat + ")"}
                            </em>

                            <Divider />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                mt: "5px",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    bgcolor: "info.light",
                                    p: "5px",
                                    borderRadius: "5px 5px 0 0",
                                }}
                            >
                                Sessions
                            </Typography>
                            {_class.sessions?.map((s, ind) => (
                                <Box
                                    key={ind}
                                    sx={{
                                        px: "10px",
                                        py: "5px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography>
                                            {dayjs(s.date).format("lll")}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontStyle: "italic",
                                                opacity: 0.8,
                                            }}
                                        >
                                            {s.duration}
                                            {" hrs"}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                mt: "5px",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    bgcolor: "info.light",
                                    p: "5px",
                                    borderRadius: "5px 5px 0 0",
                                }}
                            >
                                Exams
                            </Typography>
                            {exams.map((e, ind) => (
                                <Box
                                    key={ind}
                                    sx={{
                                        px: "10px",
                                        py: "5px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography>{e.name}</Typography>
                                        <Typography
                                            sx={{
                                                fontStyle: "italic",
                                                opacity: 0.8,
                                            }}
                                        >
                                            {dayjs(e.date).format("lll")}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
