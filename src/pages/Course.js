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
    Button,
    IconButton,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import CourseCard from "../components/CourseCard";
import { useNavigate, useParams } from "react-router-dom";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";
import postData from "../functions/postData";
import { SERVER_URL } from "../assets/constants";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import DocumentDialog from "../components/DocumentDialog";
import DownloadIcon from "@mui/icons-material/Download";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";

dayjs.extend(LocalizedFormat);

export default function Course() {
    const [course, setCourse] = React.useState({});
    const [_class, setClass] = React.useState({});
    const [teacher, setTeacher] = React.useState({});
    const [exams, setExams] = React.useState([]);
    const [documents, setDocuments] = React.useState([]);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(true);
    const [showDocumentDialog, setShowDocumentDialog] = React.useState(false);

    const {
        feedBack,
        dispatchApp,
        appState: { user },
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
                    setDocuments(data.documents);
                }
            } else feedBack("Failed to fetch data");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewDocument = async ({ files, title, body }) => {
        try {
            setIsLoading(true);

            const formData = new FormData();

            files.forEach((f) => {
                formData.append("files", f);
            });

            formData.append("title", title);
            formData.append("body", body);
            formData.append("teacherName", user.name + " " + user.surName);

            const { status, newToken } = await postData({
                url: "/api/documents/" + courseCode + "/" + classId,
                body: formData,
                headers: {
                    "Accept": "application/json",
                },
            });

            if (newToken) dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            if (status === 201) {
                feedBack("Document saved successfully.", "success");
                const newFiles = files.map((f) => ({ fileName: f.name }));
                setDocuments([
                    {
                        files: newFiles,
                        title,
                        body,
                        teacherName: user.name + " " + user.surName,
                    },
                    ...documents,
                ]);
                setShowDocumentDialog(false);
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletDocument = async (_id) => {
        if (window.confirm("Do you really want to delete this documents?")) {
            const { status } = await postData({
                url: "/api/documents/" + _id,
                method: "DELETE",
            });

            if (status === 204) {
                feedBack("Document deleted successfully", "success");
                setDocuments((documents) =>
                    documents.filter((d) => d._id !== _id)
                );
            } else feedBack("Failed to delete document");
        }
    };

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
                {!user.isTeacher && (
                    <Box>
                        <Button
                            title="start an online for this course"
                            onClick={() =>
                                navigate(
                                    "/courses/online/" +
                                        classId +
                                        "/" +
                                        teacherId
                                )
                            }
                            size="small"
                            sx={{
                                mr: "10px",
                                fontWeight: "bold",
                                fontSize: "15px",
                            }}
                        >
                            Join the online Class
                        </Button>
                    </Box>
                )}
                {user.isTeacher && (
                    <Box>
                        <Button
                            title="start an online for this course"
                            onClick={() =>
                                navigate("/courses/host-online/" + classId)
                            }
                            size="small"
                            sx={{
                                mr: "10px",
                                fontWeight: "bold",
                                fontSize: "15px",
                            }}
                        >
                            New Online Class
                        </Button>
                        <Button
                            title="can be assignments, notes, videos,..."
                            onClick={() => setShowDocumentDialog(true)}
                            size="small"
                            sx={{
                                mr: "10px",
                                fontWeight: "bold",
                                fontSize: "15px",
                            }}
                        >
                            New Document
                        </Button>
                        <Button
                            title="program a new exam for this course"
                            onClick={() =>
                                navigate(
                                    "/exams/new-exam/" +
                                        courseCode +
                                        "/" +
                                        classId
                                )
                            }
                            size="small"
                            sx={{
                                mr: "10px",
                                fontWeight: "bold",
                                fontSize: "15px",
                            }}
                        >
                            New Exam
                        </Button>
                    </Box>
                )}
            </Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                height: { md: "310px" },
                                overflowY: "auto",
                                maxHeight: { xs: "80vh" },
                            }}
                        >
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

                            <Box sx={{ px: "10px" }}>
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
                                    <em>theory </em> : {_class.time?.theory}{" "}
                                    <em>hrs</em>, <em>practices </em> :{" "}
                                    {_class.time?.practices} <em>hrs</em>,{" "}
                                    <em>exercises </em> :
                                    {_class.time?.exercises} <em>hrs</em>
                                </Typography>
                                <Typography display="inline" variant="body1">
                                    Teacher :
                                </Typography>
                                <Typography
                                    marginLeft="4px"
                                    display="inline"
                                    variant="h6"
                                >
                                    {teacher?.name +
                                        " " +
                                        teacher?.surName +
                                        " "}{" "}
                                </Typography>
                                <em>
                                    {teacher?.diplomat &&
                                        "(" + teacher?.diplomat + ")"}
                                </em>

                                <Divider />
                            </Box>
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
                                Sessions
                            </Typography>
                            <Box
                                sx={{
                                    height: { md: "260px" },
                                    overflowY: "auto",
                                    maxHeight: { xs: "80vh" },
                                }}
                            >
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
                            </Box>
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
                            <Box
                                sx={{
                                    height: { md: "260px" },
                                    overflowY: "auto",
                                    maxHeight: { xs: "80vh" },
                                }}
                            >
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
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
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
                                Documents
                            </Typography>
                            {documents.map((doc, ind) => (
                                <Box key={ind}>
                                    <Box
                                        sx={{
                                            px: "10px",
                                            py: "5px",
                                            display: "flex",
                                            "&:hover .delete-doc": {
                                                display: "inline-flex",
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                flex: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <Typography variant="h6">
                                                    {doc.title}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {user._id ===
                                                        doc.teacherId && (
                                                        <IconButton
                                                            title="delete this document"
                                                            className="delete-doc"
                                                            onClick={() =>
                                                                handleDeletDocument(
                                                                    doc._id
                                                                )
                                                            }
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                display: "none",
                                                                p: "0px",
                                                                mr: "10px",
                                                            }}
                                                        >
                                                            <RemoveCircleIcon />
                                                        </IconButton>
                                                    )}
                                                    <Typography>
                                                        <em>
                                                            {doc.teacherName}
                                                        </em>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body1">
                                                {doc.body}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            maxWidth: "100%",
                                            overflowX: "auto",
                                        }}
                                    >
                                        {doc.files?.map((f, ind) => (
                                            <Box
                                                key={ind}
                                                sx={{
                                                    "& .MuiIconButton-root a": {
                                                        mx: "auto",
                                                    },
                                                    px: "5px",
                                                    pb: "5px",
                                                    border: "0px solid lightgray",
                                                    borderRightWidth: "1px",
                                                    maxWidth: "max-content",
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    <em>{f.fileName}</em>
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                    }}
                                                >
                                                    <a
                                                        download
                                                        href={
                                                            SERVER_URL +
                                                            "/api/documents/" +
                                                            f.fileName
                                                        }
                                                    >
                                                        <IconButton
                                                            title="download this file"
                                                            color="success"
                                                            size="small"
                                                        >
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </a>
                                                    <a
                                                        target="_blank"
                                                        href={
                                                            SERVER_URL +
                                                            "/api/documents/" +
                                                            f.fileName
                                                        }
                                                        rel="noreferrer"
                                                    >
                                                        <IconButton
                                                            title="open this file in browser"
                                                            color="info"
                                                            size="small"
                                                        >
                                                            <OpenInBrowserIcon fontSize="small" />
                                                        </IconButton>
                                                    </a>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Divider color="success.light" />
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <DocumentDialog
                open={showDocumentDialog}
                onClose={() => {
                    setShowDocumentDialog(false);
                }}
                onSave={handleNewDocument}
            />
        </Container>
    );
}
