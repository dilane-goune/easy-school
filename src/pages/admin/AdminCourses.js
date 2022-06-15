import React, { useState } from "react";
import Select from "../../components/Select";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Table from "../../components/Table";
import UpdateCourseDialog from "./UpdateCourseDialog";
import { ReactSortable } from "react-sortablejs";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Container,
    Box,
    Grid,
    Button,
    Divider,
    Typography,
    Paper,
    CircularProgress,
    Backdrop,
} from "@mui/material";
import fetchData from "../../functions/fetchData";
import Label from "../../components/Label";
import globalContext from "../../context/globalContext";
import postData from "../../functions/postData";

dayjs.extend(LocalizedFormat);
const COLORS = ["#ed6c02", "#ff9800", "#9c27b0", "#2e7d32", "#01579b"];

export default function AdminCourses() {
    // states
    const [selectedOption, setSelectedOption] = useState(1);

    const [currentCourse, setCurrentCouse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        name: "",
        level: "L1",
        courseCode: "",
    });

    const [courseChapters, setCourseChapters] = useState([]);
    const [newChapter, setNewChapter] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [showUpdateCourseModal, setShowUpdateCouseModal] = useState(false);

    React.useEffect(() => {
        fetchData("/api/admin/courses").then((data) => {
            if (data instanceof Array) {
                setCourses(data);
                if (!data?.length) setSelectedOption(2);
            } else feedBack("Failed to fetch data");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // functions
    const { feedBack, dispatchApp } = React.useContext(globalContext);

    const handleNewCouse = async (e) => {
        const finalChapters = courseChapters.map((c) => c.name);
        const finalCourse = {
            ...newCourse,
            chapters: finalChapters,
            color: COLORS[Math.round(Math.random() * 10) % COLORS.length],
        };

        try {
            setIsLoading(true);

            const { status, newToken } = await postData({
                url: "/api/admin/courses",
                method: "POST",
                body: JSON.stringify(finalCourse),
            });
            newToken && dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 409) {
                feedBack("There is already a course with this code.");
                return;
            }
            if (status === 201) {
                feedBack("Course added successfully.", "success");

                setCourses([...courses, finalCourse]);

                setCourseChapters([]);
                setNewCourse({
                    name: "",
                    level: "L1",
                    courseCode: "",
                });
                setNewChapter("");
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.", "warning");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCourseCourses = async (course) => {
        setIsLoading(true);
        const { status } = await postData({
            url: "/api/admin/courses",
            method: "PUT",
            body: JSON.stringify({
                ...course,
                chapters: course.chapters.map((c) => c.name),
            }),
        });
        if (status === 200) {
            feedBack("Course added successfully.", "success");
            setCourses(
                courses.map((c) => {
                    if (c.courseCode === course.courseCode)
                        return {
                            ...c,
                            chapters: course.chapters.map((c) => c.name),
                        };
                    return c;
                })
            );
            setCurrentCouse({
                ...currentCourse,
                chapters: course.chapters.map((c) => c.name),
            });
            setShowUpdateCouseModal(false);
        } else feedBack("Sothing when wrong. Please try again.");
        setIsLoading(false);
    };

    return (
        <Container>
            <PageHeader title="Courses" noSearch />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Table
                        data={courses}
                        headData={[
                            { label: "Name", key: "name" },
                            { label: "Code", key: "courseCode" },
                            { label: "Level", key: "level" },
                        ]}
                        numbered
                        // actionItem={<MoreVertIcon size={18} />}
                        onClick={(data) => {
                            if (selectedOption !== 1) setSelectedOption(1);
                            setCurrentCouse(data);
                        }}
                        asPage
                        // small
                    />
                </Grid>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                    >
                        <Button
                            size="small"
                            variant={
                                selectedOption === 1 ? "contained" : "outlined"
                            }
                            sx={{
                                borderRadius: "20px",
                            }}
                            onClick={() => {
                                setSelectedOption(1);
                            }}
                        >
                            Properties
                        </Button>
                        <Button
                            size="small"
                            variant={
                                selectedOption === 2 ? "contained" : "outlined"
                            }
                            sx={{
                                borderRadius: "20px",
                            }}
                            onClick={() => {
                                setSelectedOption(2);
                            }}
                        >
                            New Course
                        </Button>
                    </Box>
                    {selectedOption === 1 ? (
                        currentCourse ? (
                            <Paper sx={{ p: "10px", mt: "10px" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Properties
                                    </Typography>
                                    <Button
                                        onClick={() =>
                                            setShowUpdateCouseModal(true)
                                        }
                                    >
                                        Edit
                                    </Button>
                                </Box>
                                <Label
                                    label="Name"
                                    value={currentCourse.name}
                                />
                                <Label
                                    label="Code"
                                    value={currentCourse.courseCode}
                                />
                                <Label
                                    label="Level"
                                    value={currentCourse.level}
                                />
                                <Label
                                    label="Date added"
                                    value={dayjs(
                                        currentCourse.createdAt
                                    ).format("lll")}
                                />

                                <Divider />
                                <Typography variant="h6">Chapters</Typography>
                                <Box padding="0 20px">
                                    <Table
                                        data={currentCourse.chapters.map(
                                            (chap) => {
                                                return { name: chap };
                                            }
                                        )}
                                        headData={[
                                            { label: "Name", key: "name" },
                                        ]}
                                        numbered
                                        small
                                    />
                                </Box>
                            </Paper>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{ textAlign: "center", mt: "20%" }}
                            >
                                Click a row to see it properties
                            </Typography>
                        )
                    ) : (
                        <Paper sx={{ px: "10px", mt: "10px" }}>
                            <Box px="30px" py="10px">
                                <Input
                                    value={newCourse.name}
                                    onChange={(val) =>
                                        setNewCourse({
                                            ...newCourse,
                                            name: val,
                                        })
                                    }
                                    sx={{ my: "5px" }}
                                    label="Course Name"
                                />
                                <Box display="flex">
                                    <Input
                                        value={newCourse.courseCode}
                                        onChange={(val) =>
                                            setNewCourse({
                                                ...newCourse,
                                                courseCode: val,
                                            })
                                        }
                                        sx={{ my: "5px" }}
                                        label="Code"
                                    />
                                    <Select
                                        marginLeft="20px"
                                        width="40%"
                                        sx={{ my: "5px" }}
                                        options={["L1", "L2", "L3", "M1", "M2"]}
                                        label="Level"
                                        onChange={(val) => {
                                            setNewCourse({
                                                ...newCourse,
                                                level: val,
                                            });
                                        }}
                                        value={newCourse.level}
                                    />
                                </Box>
                                <Typography variant="h6">Chapters</Typography>
                                {/* new chapter */}
                                <Box>
                                    <input
                                        style={{
                                            borderRadius: "20px",
                                            border: "1px solid #ada8a8",
                                            textAlign: "center",
                                            width: "80%",
                                            margin: "5px 10%",
                                            padding: "5px",
                                            boxSizing: "border-box",
                                            fontFamily: "Roboto",
                                        }}
                                        value={newChapter}
                                        onChange={(e) =>
                                            setNewChapter(e.target.value)
                                        }
                                        placeholder="new chapter"
                                        className="new-chapter-input"
                                        onKeyDown={(e) => {
                                            if (
                                                newChapter.trim() !== "" &&
                                                e.key === "Enter"
                                            ) {
                                                setCourseChapters([
                                                    ...courseChapters,
                                                    {
                                                        id:
                                                            courseChapters.length +
                                                            1,
                                                        name: newChapter,
                                                    },
                                                ]);
                                                setNewChapter("");
                                            }
                                        }}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        maxHeight: "270px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <ReactSortable
                                        list={courseChapters}
                                        setList={setCourseChapters}
                                    >
                                        {courseChapters.map((item, ind) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: "flex",
                                                    border: "1px solid #ada8a8",
                                                    justifyContent:
                                                        "space-between",
                                                    p: "0 5px 0 10px",
                                                    mb: "5px",
                                                    cursor: "grab",

                                                    "& .MuiSvgIcon-root": {
                                                        display: "none",
                                                    },
                                                    "&:hover .MuiSvgIcon-root":
                                                        {
                                                            color: "red",
                                                            display: "initial",
                                                        },
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    {ind + 1 + ". " + item.name}
                                                </Typography>
                                                <DeleteIcon
                                                    onClick={() => {
                                                        setCourseChapters(
                                                            courseChapters.filter(
                                                                (c) =>
                                                                    c.id !==
                                                                    item.id
                                                            )
                                                        );
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </ReactSortable>
                                </Box>
                                <Box display="flex" justifyContent="center">
                                    <Button
                                        onClick={handleNewCouse}
                                        disabled={
                                            !newCourse.name ||
                                            !newCourse.courseCode ||
                                            isLoading
                                        }
                                        variant="contained"
                                        size="small"
                                        sx={{ mt: "5px" }}
                                    >
                                        Add Course
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {showUpdateCourseModal && currentCourse && (
                <UpdateCourseDialog
                    open
                    onClose={() => setShowUpdateCouseModal(false)}
                    originalCourse={currentCourse}
                    onSave={handleUpdateCourseCourses}
                />
            )}
        </Container>
    );
}
