/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Select from "../components/Select";
import {
    Container,
    Box,
    Paper,
    Backdrop,
    CircularProgress,
    ListSubheader,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Button,
    Divider,
    Typography,
    Checkbox,
    IconButton,
    FormControlLabel,
} from "@mui/material";
import CheckSharpIcon from "@mui/icons-material/CheckSharp";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MyDialog from "../components/MyDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import Input from "../components/Input";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import extendUserToken from "../functions/extendUserToken";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";

export default function Questions() {
    const USER = JSON.parse(sessionStorage.getItem("user"));
    // states

    const [questions, setQuestions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);

    const [newQuestion, setNewQuestion] = useState({
        question: "",
        courseCode: "",
        answers: [],
        private: false,
    });

    const [newAnswer, setNewAnswer] = useState({ value: "", isCorrect: false });

    const [isLoading, setIsLoading] = useState(true);
    const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);

    const [filterOptions, setFilterOptions] = useState({
        level: "*",
        courseCode: "*",
        teacherId: "*",
    });

    const [currentIndex, setCurrentIndex] = React.useState(null);

    // functions

    const {
        feedBack,
        dispatchApp,
        appState: { token, user },
    } = React.useContext(globalContext);

    const handleNewQuestion = async (e) => {
        newQuestion.specialization = USER?.specialization;

        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/questions", {
                method: "POST",
                body: JSON.stringify(newQuestion),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendUserToken();

                res = await fetch("/api/questions", {
                    method: "POST",
                    body: JSON.stringify(newQuestion),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
                dispatchApp({ action: "SET_TOKEN", token: newToken });
            }

            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.");
                return;
            }
            if (res.status === 400) {
                feedBack(
                    "Bad request. make sure each question has arleast one answer"
                );
                return;
            }

            feedBack("Question added successfully.", "success");

            newQuestion.teacherId = USER?._id;

            const { _id } = await res.json();
            newQuestion._id = _id;

            setQuestions([...questions, newQuestion]);

            setNewQuestion({
                question: "",
                variant: "checkBox",
                courseCode: "",
                answers: [],
                private: false,
            });
        } catch (e) {
            setIsLoading(false);
            feedBack("Sothing when wrong. Please try again.");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteQuestion = async (questionId) => {
        if (window.confirm("Do you really want to delete this question?")) {
            try {
                setIsLoading(true);

                let newToken;
                let res = await fetch("/api/questions/" + questionId, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + token,
                    },
                });

                if (res.status === 403) {
                    newToken = await extendUserToken();

                    res = await fetch("/api/questions/" + questionId, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: "BEARER " + newToken,
                        },
                    });
                }

                if (res.status === 500) {
                    feedBack("Sothing when wrong. Please try again.");
                    return;
                }

                if (res.status === 401) {
                    feedBack("Unauthorised");
                    return;
                }

                if (res.status === 204) {
                    feedBack("Question Deleted", "info");
                    setQuestions(questions.filter((q) => q._id !== questionId));
                    return;
                }

                setIsLoading(false);
            } catch (e) {
                feedBack("Sothing when wrong. Please try again.");
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleQuesIndex = (index) => {
        if (currentIndex === index) return setCurrentIndex(null);
        setCurrentIndex(index);
    };

    // effects

    useEffect(() => {
        fetchData("/api/questions?specialization=" + user?.specialization).then(
            (data) => {
                if (data instanceof Object) {
                    setCourses(data.courses);
                    setTeachers(data.teachers);
                    setQuestions(data.questions);
                } else feedBack("Failed to fetch data");
                setIsLoading(false);
            }
        );
    }, []);

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff" }} open>
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
                <PageHeader title="Questions" noSearch />{" "}
                <Box>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setShowNewQuestionDialog(true)}
                        sx={{ borderRadius: "20px" }}
                    >
                        New Question
                    </Button>
                </Box>
            </Box>
            <Divider sx={{ my: "5px" }} />
            <Typography>Filter</Typography>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    "& .MuiSelect-select": {
                        minWidth: "120px",
                    },
                    my: "5px",
                }}
            >
                <Select
                    label="level"
                    value={filterOptions.level}
                    onChange={(val) =>
                        setFilterOptions({ ...filterOptions, level: val })
                    }
                    options={[
                        { label: "All", value: "*" },
                        "L1",
                        "L2",
                        "L3",
                        "M1",
                        "M2",
                    ]}
                    height="30px"
                    rounded
                />
                <Select
                    label="course"
                    value={filterOptions.courseCode}
                    onChange={(val) =>
                        setFilterOptions({ ...filterOptions, courseCode: val })
                    }
                    options={[{ label: "All", value: "*" }].concat(
                        courses.map((c) => {
                            return { label: c.name, value: c.courseCode };
                        })
                    )}
                    height="30px"
                    rounded
                />
                <Select
                    label="teacher"
                    value={filterOptions.teacherId}
                    onChange={(val) =>
                        setFilterOptions({ ...filterOptions, teacherId: val })
                    }
                    options={[{ label: "All", value: "*" }].concat(
                        teachers.map((t) => {
                            return {
                                label: t.name + " " + t.surName,
                                value: t._id,
                            };
                        })
                    )}
                    height="30px"
                    rounded
                />
            </Box>

            <Paper>
                {questions.length === 0 ? (
                    <Typography
                        sx={{
                            textAlign: "center",
                            py: "50px",
                        }}
                    >
                        Empty List, you can add some questions for your courses
                    </Typography>
                ) : (
                    <List
                        sx={{
                            width: "100%",
                            // maxWidth: 360,
                            bgcolor: "background.paper",
                        }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader
                                component="div"
                                id="nested-list-subheader"
                            >
                                Questions List
                            </ListSubheader>
                        }
                    >
                        {questions
                            .filter((q) => {
                                const condition =
                                    (q.teacherId === filterOptions.teacherId ||
                                        filterOptions.teacherId === "*") &&
                                    (q.courseCode ===
                                        filterOptions.courseCode ||
                                        filterOptions.courseCode === "*") &&
                                    (q.courseCode ===
                                        filterOptions.courseCode ||
                                        filterOptions.courseCode === "*");
                                return condition;
                            })
                            .map((q, index) => {
                                return (
                                    <Box
                                        key={index}
                                        sx={{ position: "relative" }}
                                    >
                                        <ListItemButton
                                            onClick={() =>
                                                handleQuesIndex(index)
                                            }
                                        >
                                            <ListItemIcon>
                                                {index + 1}
                                            </ListItemIcon>{" "}
                                            <ListItemText>
                                                {q.question}
                                            </ListItemText>
                                            {currentIndex === index ? (
                                                <ExpandLess />
                                            ) : (
                                                <ExpandMore />
                                            )}
                                        </ListItemButton>

                                        {q.answers instanceof Array &&
                                            q.answers.map((ans, ind) => {
                                                return (
                                                    <Collapse
                                                        key={ind}
                                                        in={
                                                            currentIndex ===
                                                            index
                                                        }
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Box
                                                            sx={{
                                                                pl: 4,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                "& .MuiSvgIcon-root":
                                                                    {
                                                                        mr: "10px",
                                                                    },
                                                            }}
                                                        >
                                                            {ans.isCorrect ? (
                                                                <CheckSharpIcon
                                                                    color="success"
                                                                    fontSize="15"
                                                                />
                                                            ) : (
                                                                <ClearSharpIcon
                                                                    color="error"
                                                                    fontSize="15"
                                                                />
                                                            )}

                                                            <ListItemText
                                                                secondary={
                                                                    ans.value
                                                                }
                                                            />
                                                        </Box>
                                                    </Collapse>
                                                );
                                            })}
                                        {USER?._id === q.teacherId && (
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    deleteQuestion(q._id)
                                                }
                                                sx={{
                                                    position: "absolute",
                                                    right: "10px",
                                                    bottom: "0px",
                                                    display:
                                                        index === currentIndex
                                                            ? "initial"
                                                            : "none",
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                );
                            })}
                    </List>
                )}
            </Paper>

            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <MyDialog
                onClose={() => setShowNewQuestionDialog(false)}
                title="New Question"
                open={showNewQuestionDialog}
                helperText={`A question must have atleast two answers, and atleast one correct.
                Click an answer correct status to toggle it. Hover on answers to delete.`}
                fullScreen
                actionButtons={[
                    {
                        label: "Save",
                        disabled:
                            !newQuestion.question ||
                            !newQuestion.courseCode ||
                            newQuestion.answers.length < 2 ||
                            !newQuestion.answers.find((ans) => ans.isCorrect),
                        onClick: handleNewQuestion,
                    },
                ]}
            >
                <Box sx={{ minHeight: "200px" }}>
                    <Box component="form" display="flex" sx={{ mb: "10px" }}>
                        <Select
                            label="course"
                            value={newQuestion.courseCode}
                            options={courses.map((c) => {
                                return { label: c.name, value: c.courseCode };
                            })}
                            onChange={(val) =>
                                setNewQuestion({
                                    ...newQuestion,
                                    courseCode: val,
                                })
                            }
                            rounded
                            sx={{
                                minWidth: "200px",
                            }}
                            height="30px"
                        />

                        <FormControlLabel
                            sx={{ m: 0, p: 0, ml: "10px" }}
                            label="pivate"
                            control={
                                <Checkbox
                                    checked={newQuestion.private}
                                    onChange={(e) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            private: e.target.checked,
                                        })
                                    }
                                    sx={{
                                        m: 0,
                                        p: 0,
                                    }}
                                />
                            }
                        />
                    </Box>
                    <Input
                        label="Question"
                        value={newQuestion.question}
                        onChange={(val) =>
                            setNewQuestion({
                                ...newQuestion,
                                question: val,
                            })
                        }
                    />

                    <Box
                        // component="form"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Checkbox
                            checked={newAnswer.isCorrect}
                            onChange={(e) =>
                                setNewAnswer({
                                    value: newAnswer.value,
                                    isCorrect: e.target.checked,
                                })
                            }
                        />
                        <Input
                            placeholder="new answer"
                            value={newAnswer.value}
                            onChange={(val) =>
                                setNewAnswer({
                                    isCorrect: newAnswer.isCorrect,
                                    value: val,
                                })
                            }
                            variant="standard"
                            sx={{ flex: 1 }}
                        />
                        <IconButton
                            color="primary"
                            disabled={!newAnswer.value}
                            onClick={() => {
                                setNewQuestion({
                                    ...newQuestion,
                                    answers: [
                                        ...newQuestion.answers,
                                        newAnswer,
                                    ],
                                });
                                setNewAnswer({ value: "", isCorrect: false });
                            }}
                        >
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </Box>
                    {/* <Divider /> */}
                    <Typography>Answers</Typography>
                    <Box>
                        {newQuestion.answers.map((ans, ind) => {
                            return (
                                <Box
                                    key={ind}
                                    sx={{
                                        pl: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        "& .MuiSvgIcon-root": {
                                            mr: "10px",
                                        },
                                        "&:hover .delete-icon": {
                                            color: "red",
                                            display: "initial",
                                        },
                                        position: "relative",
                                    }}
                                >
                                    {
                                        <DeleteIcon
                                            onClick={() => {
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    answers:
                                                        newQuestion.answers.filter(
                                                            (f, index) =>
                                                                ind !== index
                                                        ),
                                                });
                                            }}
                                            className="delete-icon"
                                            sx={{
                                                display: "none",
                                                position: "absolute",
                                                left: "2px",
                                            }}
                                        />
                                    }
                                    {
                                        <section
                                            onClick={() => {
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    answers:
                                                        newQuestion.answers.map(
                                                            (an, anIndex) => {
                                                                return anIndex ===
                                                                    ind
                                                                    ? {
                                                                          value: an.value,
                                                                          isCorrect:
                                                                              !an.isCorrect,
                                                                      }
                                                                    : an;
                                                            }
                                                        ),
                                                });
                                            }}
                                        >
                                            {ans.isCorrect ? (
                                                <CheckSharpIcon
                                                    color="success"
                                                    fontSize="19"
                                                />
                                            ) : (
                                                <ClearSharpIcon
                                                    color="error"
                                                    fontSize="19"
                                                />
                                            )}
                                        </section>
                                    }
                                    <ListItemText secondary={ans.value} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </MyDialog>
        </Container>
    );
}
