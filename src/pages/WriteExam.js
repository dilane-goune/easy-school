import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Backdrop,
    CircularProgress,
    Alert,
} from "@mui/material";
import fetchData from "../functions/fetchData";
import globalContext from "../context/globalContext";
import { useParams } from "react-router-dom";
import extendUserToken from "../functions/extendUserToken";

const QuestionItem = ({
    question,
    answers,
    questionId,
    index,
    onAnswer = () => {},
}) => {
    return (
        <Box sx={{ display: "flex", mb: "10px" }}>
            <Typography>{index}</Typography>
            <Box
                sx={{
                    ml: "4px",
                    pl: "4px",
                    border: "1px solid gray",
                    borderWidth: 0,
                    borderLeftWidth: "1px",
                }}
            >
                <Typography sx={{ opacity: 0.8 }}>{question}</Typography>

                {answers.map((ans, ind) => {
                    return (
                        <Box key={ind} sx={{ mb: "2px" }}>
                            <input
                                checked={ans.response}
                                type="checkbox"
                                onChange={(e) => {
                                    onAnswer(questionId, ans, e.target.checked);
                                }}
                            />{" "}
                            <label>{ans?.value}</label>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

const timeGenerator = (time) => {
    const hours = "" + parseInt(time / 3600000);

    let remenderHrs = time / 3600000 - hours;
    const minutes = `${parseInt(remenderHrs * 60)}`.padStart(2, "0");

    const renderMins = remenderHrs * 60 - minutes;

    const seconds = `${parseInt(renderMins * 60)}`.padStart(2, "0");
    return (
        <Typography
            variant="h6"
            sx={{ color: minutes <= 20 ? "error.main" : "success.main" }}
        >
            Time Left : <strong>{hours} </strong> hrs{" "}
            <strong>{minutes} </strong> min <strong>{seconds} </strong> sec
        </Typography>
    );
};

const Timer = ({ initialTime = 0, onTimeFinish = () => {} }) => {
    const [time, setTime] = useState(initialTime > 0 ? initialTime : 0);

    React.useEffect(() => {
        if (initialTime > 1) {
            const interval = setInterval(() => {
                if (time > 0) setTime((seconds) => seconds - 1000);
                else {
                    onTimeFinish();
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time]);

    return timeGenerator(time);
};

export default function WriteExam() {
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [exam, setExam] = useState({});
    const [timing, setTiming] = useState(0);

    const [error, setError] = useState({ status: false, message: "" });

    const {
        feedBack,
        appState: { user, token },
        dispatchApp,
    } = React.useContext(globalContext);

    const { examId } = useParams();

    // effects
    React.useEffect(() => {
        const addResponse = (answers = []) => {
            return answers.map((ans) => ({ ...ans, response: false }));
        };
        fetchData("/api/exams/write/" + examId).then((data) => {
            if (data instanceof Object) {
                setQuestions(
                    data.questions?.map((q) => ({
                        ...q,
                        answers: addResponse(q.answers),
                    }))
                );
                setExam(data.exam);

                const startTime = new Date(data.exam?.date).valueOf();
                const currentTime = new Date().valueOf();
                setTiming(
                    startTime -
                        currentTime +
                        data.exam.duration * 60 * 60 * 1000
                );
            } else {
                const messages = {
                    401: "Unauthorised",
                    402: "You have already written the exam",
                    404: "Cant access the server. Make sure you have acces to th network",
                    406: "This Exam has passed",
                    450: "This Exam has not yet started. Be preparing..",
                };
                setError({
                    status: true,
                    message:
                        messages[data] ||
                        "Something when wrong. It may be a server error.",
                });
            }
            setIsLoading(false);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAnswerQuestion = (questionId, answerValue, checked) => {
        setQuestions(
            questions.map((q) => {
                if (q.questionId === questionId) {
                    return {
                        questionId,

                        question: q.question,

                        answers: q.answers.map((ans) =>
                            ans._id === answerValue._id
                                ? { ...ans, response: checked }
                                : ans
                        ),
                    };
                }
                return q;
            })
        );
    };

    const handleSubmitExam = async () => {
        const data = {
            questions,
            examId,
            userId: user._id,
        };

        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/exams/write/", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendUserToken();

                res = await fetch("/api/exams/write/", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
                dispatchApp({ type: "SET_TOKEN", token: newToken });
            }

            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            if (res.status === 406) {
                setError({
                    status: true,
                    message: "Your are too late.",
                });
                feedBack("Too late");
                return;
            }
            if (res.status === 402) {
                feedBack("You have already submit your exam");
                return;
            }
            if (res.status === 201) {
                const data = await res.json();
                setResult(data);

                return true;
            } else {
                feedBack("Sothing when wrong. Please try submittig again.");
            }
        } catch (e) {
            feedBack(
                "Sothing when wrong. Make sure you have access to the network."
            );
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff" }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );

    if (error.status)
        return (
            <Box>
                <Typography sx={{ textAlign: "center" }} variant="h4">
                    {error.message}
                </Typography>
            </Box>
        );

    if (result)
        return (
            <Box>
                <Typography sx={{ textAlign: "center" }} variant="h4">
                    Exam terminated. You got {result.mark} / {result.total}
                </Typography>
            </Box>
        );

    return (
        <Box
            sx={{
                px: { xs: "10px", md: "20px" },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: "50px",
                    bgcolor: "#fff",
                    zIndex: 500,
                }}
            >
                <Typography variant="h6">{exam.name}</Typography>
                <Timer initialTime={timing} onTimeFinish={handleSubmitExam} />
            </Box>
            <Box>
                <Alert sx={{ py: "0" }} severity="warning">
                    <Typography>
                        <strong>D</strong>onot refresh, else you will loss you
                        progress.
                    </Typography>
                    <Typography>
                        <strong>T</strong>he exam will be submitted only once
                        and this is done automatically as time elapses.
                    </Typography>
                    <Typography>
                        <strong>M</strong>ake sure you check your work before
                        submitting.
                    </Typography>
                </Alert>
            </Box>
            <Box sx={{ mt: "10px" }}>
                {questions.map((q, index) => {
                    return (
                        <QuestionItem
                            key={index}
                            question={q.question}
                            answers={q.answers}
                            questionId={q.questionId}
                            onAnswer={handleAnswerQuestion}
                            index={("" + (index + 1)).padStart(2, "0")}
                        />
                    );
                })}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    "& .MuiAlert-message .MuiAlert-icon": {
                        py: "0",
                        my: "auto",
                    },
                }}
            >
                <Box></Box>
                <Button
                    disabled={!result === null}
                    sx={{ borderRadius: "20px", elevation: 5 }}
                    variant="contained"
                    size="small"
                    onClick={handleSubmitExam}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
}
