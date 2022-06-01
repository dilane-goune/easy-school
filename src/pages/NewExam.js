/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
    Container,
    Typography,
    Grid,
    Box,
    Divider,
    Paper,
    Backdrop,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    InputAdornment,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import { useParams } from "react-router-dom";
import extendUserToken from "../functions/extendUserToken";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MyDialog from "../components/MyDialog";
import CheckSharpIcon from "@mui/icons-material/CheckSharp";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import Input from "../components/Input";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";

dayjs.extend(LocalizedFormat);
dayjs.extend(RelativeTime);

export default function NewExam() {
    // states

    const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [questions, setQuestions] = useState([]);
    // const [teachers, setTeachers] = useState([]);

    const [newAnswer, setNewAnswer] = useState({
        correctPoints: 1,
        wrongPoints: 0,
        required: true,
    });

    const [newExam, setNewExam] = useState({
        date: "",
        name: "",
        duration: 2,
    });
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [examQuestions, setExamQuestions] = useState([]);

    // const [filterOptions, setFilterOptions] = useState({
    //     level: "*",
    //     courseCode: "*",
    //     teacherId: "*",
    // });

    const { courseCode, classId } = useParams();

    // functions
    const {
        appState: { user, token },
        feedBack,
        dispatchApp,
    } = React.useContext(globalContext);

    // effects
    React.useEffect(() => {
        fetchData(
            "/api/exams/questions/" + user.specialization + "/" + courseCode
        ).then((data) => {
            if (data instanceof Object) {
                // setTeachers(data.teachers);
                setQuestions(data.questions);
            } else feedBack("Failed to fetch data");
        });
    }, []);

    // functions
    const handleAddNewQuestion = () => {
        setExamQuestions([
            ...examQuestions,
            {
                questionId: currentQuestion._id,
                ...currentQuestion,
                ...newAnswer,
            },
        ]);
        setQuestions(questions.filter((q) => q._id !== currentQuestion._id));

        setShowNewQuestionDialog(false);
    };

    const handleNewExam = async () => {
        newExam.questions = examQuestions.map((eq) => {
            return {
                correctPoints: eq.correctPoints,
                wrongPoints: eq.wrongPoints,
                questionId: eq.questionId,
                required: eq.required,
            };
        });
        newExam.courseCode = courseCode;
        newExam.classId = classId;

        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/exams", {
                method: "POST",
                body: JSON.stringify({
                    ...newExam,
                    date: new Date(newExam.date).valueOf(),
                }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendUserToken();

                res = await fetch("/api/exams", {
                    method: "POST",
                    body: JSON.stringify({
                        ...newExam,
                        date: new Date(newExam.date).valueOf(),
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
                dispatchApp({ action: "SET_TOKEN", token: newToken });
            }

            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }
            if (res.status === 400) {
                feedBack(
                    "Bad request. make sure each field in the form is correctly filled.",
                    "warning"
                );
                return;
            }
            if (res.status === 409) {
                feedBack(
                    "An exam have already been progragramed at this time for this class",
                    "warning"
                );
                return;
            }

            if (res.status === 201) {
                feedBack("Exam saved successfully.", "success");
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

    return (
        <Container>
            <PageHeader title="New Exam" noSearch />
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Input
                    variant="standard"
                    label="Exam name"
                    helperText="This is the exam name and it is better if it's descriptive."
                    sx={{ maxWidth: "565px" }}
                    value={newExam.name}
                    onChange={(val) => {
                        setNewExam({ ...newExam, name: val });
                    }}
                />
                <Box>
                    <Input
                        variant="standard"
                        focused={false}
                        value={newExam.duration}
                        onChange={(val) => {
                            if (val > 0)
                                setNewExam({ ...newExam, duration: val });
                        }}
                        label="Duration"
                        type="number"
                        helperText="this is how long (in hours) the exam last. eg : 2.5 hrs"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    hrs
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box>
                    <Input
                        variant="standard"
                        focused
                        value={newExam.date}
                        onChange={(val) => {
                            if (val === "")
                                setNewExam({ ...newExam, date: val });
                            else if (
                                new Date(val).getTime() >
                                new Date().getTime() + 1000 * 60 * 60
                            ) {
                                setNewExam({ ...newExam, date: val });
                            }
                            setNewExam({ ...newExam, date: val });
                        }}
                        label="Date & time"
                        type="datetime-local"
                        inputStyle={{ maxWidth: "300px" }}
                        helperText={`${dayjs(newExam.date).format("lll")}  ${
                            newExam.date !== "" ? dayjs().to(newExam.date) : ""
                        }`}
                    />
                </Box>
            </Box>
            <Divider sx={{ mb: "10px" }} />
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography>Questions list</Typography>
                    <Paper sx={{ height: "60vh", overflow: "auto" }}>
                        <List>
                            {questions.map((q, ind) => {
                                return (
                                    <ListItem
                                        key={ind}
                                        divider
                                        sx={{ p: "1px 5px" }}
                                    >
                                        <ListItemText>
                                            {q.question}
                                        </ListItemText>
                                        <IconButton
                                            onClick={() => {
                                                setCurrentQuestion(q);
                                                setShowNewQuestionDialog(true);
                                            }}
                                        >
                                            <AddCircleOutlineIcon color="success" />
                                        </IconButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography>Exams questions</Typography>
                    <Paper sx={{ height: "60vh", overflow: "auto" }}>
                        {!examQuestions.length ? (
                            <Typography variant="h6" textAlign="center">
                                Empty List
                            </Typography>
                        ) : (
                            <List>
                                {examQuestions.length !== 0 &&
                                    examQuestions.map((q, ind) => {
                                        return (
                                            <Box
                                                key={ind}
                                                sx={{ p: "0px 2px" }}
                                            >
                                                <Box
                                                    display="flex"
                                                    sx={{
                                                        justifyContent:
                                                            "space-between",
                                                    }}
                                                >
                                                    <Typography>
                                                        {q.question}
                                                    </Typography>

                                                    <HighlightOffIcon
                                                        onClick={() => {
                                                            setQuestions([
                                                                ...questions,
                                                                q,
                                                            ]);
                                                            setExamQuestions(
                                                                examQuestions.filter(
                                                                    (ques) =>
                                                                        q.questionId !==
                                                                        ques.questionId
                                                                )
                                                            );
                                                        }}
                                                        color="error"
                                                    />
                                                </Box>
                                                <label
                                                    style={{
                                                        fontFamily: "Roboto",
                                                        color: "green",
                                                        fontSize: "medium",
                                                        marginRight: "20px",
                                                    }}
                                                >
                                                    correct :{" "}
                                                    {" " + q.correctPoints}
                                                    <em>pts</em>
                                                </label>
                                                <label
                                                    style={{
                                                        fontFamily: "Roboto",
                                                        color: "red",
                                                        fontSize: "medium",
                                                        marginRight: "20px",
                                                    }}
                                                >
                                                    wrong : {q.wrongPoints}
                                                    <em>pts</em>
                                                </label>
                                                <em
                                                    style={{
                                                        fontFamily: "Roboto",
                                                        color: "red",
                                                        marginRight: "20px",
                                                    }}
                                                >
                                                    {q.required && "required"}
                                                </em>
                                                <Divider />
                                            </Box>
                                        );
                                    })}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Box
                sx={{
                    bottom: "0",
                    mb: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: "5px 0",
                }}
            >
                <Box>
                    <Typography variant="body1">
                        {`${examQuestions.length} question${
                            examQuestions.length > 1 ? "s" : ""
                        }`}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={
                        !(newExam.name && newExam.date && examQuestions.length)
                    }
                    onClick={handleNewExam}
                >
                    save exam
                </Button>
            </Box>

            <MyDialog
                onClose={() => setShowNewQuestionDialog(false)}
                title="New Question"
                open={showNewQuestionDialog}
                helperText={``}
                actionButtons={[
                    {
                        label: "Add",
                        disabled:
                            !newAnswer.correctPoints && !newAnswer.wrongPoints,
                        onClick: handleAddNewQuestion,
                    },
                ]}
            >
                <Box>
                    <label style={{ fontFamily: "Roboto" }}>Points :</label>

                    <Box
                        display="inline-flex"
                        justifyContent="space-between"
                        sx={{ mx: "40px" }}
                    >
                        <label style={{ fontFamily: "Roboto", color: "green" }}>
                            correct :
                        </label>
                        <input
                            type="number"
                            style={{
                                border: "0 solid gray",
                                borderBottomWidth: "1px",
                                width: "40px",
                                marginLeft: "10px",
                                padding: 0,
                                textAlign: "center",
                            }}
                            value={newAnswer.correctPoints}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val >= 0)
                                    setNewAnswer({
                                        ...newAnswer,
                                        correctPoints: val,
                                    });
                            }}
                        />
                        <label style={{ fontFamily: "Roboto", color: "green" }}>
                            <em>pts</em>
                        </label>
                    </Box>
                    <Box
                        display="inline-flex"
                        justifyContent="space-between"
                        sx={{ mx: "40px" }}
                    >
                        <label style={{ fontFamily: "Roboto", color: "red" }}>
                            wrong :
                        </label>
                        <input
                            type="number"
                            style={{
                                border: "0 solid gray",
                                borderBottomWidth: "1px",
                                width: "40px",
                                marginLeft: "10px",
                                padding: 0,
                                textAlign: "center",
                            }}
                            value={newAnswer.wrongPoints}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val <= 0)
                                    setNewAnswer({
                                        ...newAnswer,
                                        wrongPoints: val,
                                    });
                            }}
                        />
                        <label style={{ fontFamily: "Roboto", color: "red" }}>
                            <em>pts</em>
                        </label>
                    </Box>
                    <Box
                        display="inline-flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mx: "40px" }}
                    >
                        <label style={{ fontFamily: "Roboto", color: "red" }}>
                            required
                        </label>
                        <input
                            type="checkbox"
                            style={{
                                border: "1px solid red",
                                width: "40px",
                                padding: 0,
                            }}
                            checked={newAnswer.required}
                            onChange={(e) => {
                                const val = e.target.checked;

                                setNewAnswer({
                                    ...newAnswer,
                                    required: val,
                                });
                            }}
                        />
                    </Box>
                </Box>
                <Divider />
                <Typography>{currentQuestion?.question}</Typography>
                {currentQuestion.answers?.map((ans, ind) => {
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
                            }}
                        >
                            {ans.isCorrect ? (
                                <CheckSharpIcon color="success" fontSize="15" />
                            ) : (
                                <ClearSharpIcon color="error" fontSize="15" />
                            )}

                            <ListItemText secondary={ans.value} />
                        </Box>
                    );
                })}
            </MyDialog>

            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Container>
    );
}
