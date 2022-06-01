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

const Timer = ({ initialTime = 0, onTimeFinish = () => {} }) => {
    const [time, setTime] = useState(initialTime);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (time > 0) setTime((seconds) => seconds - 1000 * 60);
            else {
                onTimeFinish();
                clearInterval(interval);
            }
        }, 1000 * 60);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time]);

    const toHours = (val) => val / 1000 / 60 / 60;

    return (
        <Typography>
            Time Left :{" "}
            <span style={{ color: "green" }}>
                {parseInt(toHours(time))}h :{" "}
                {`${parseInt((toHours(time) * 60) % 60)}`.padStart(2, 0)}min
            </span>
        </Typography>
    );
};

export default function WriteExam() {
    const [isLoading, setIsLoading] = useState(true);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [questions, setQuestions] = useState([]);
    const [exam, setExam] = useState({});
    const [timing, setTiming] = useState(1);

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
                dispatchApp({ action: "SET_TOKEN", token: newToken });
            }

            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            if (res.status === 406) {
                feedBack("Too late");
                return;
            }
            if (res.status === 402) {
                feedBack("You have already submit your exam");
                return;
            }
            if (res.status === 201) {
                feedBack(
                    "Exam saved successfully. You're results will be available in few minutes",
                    "success"
                );
                setFormSubmitted(true);
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

    return (
        <Box
            sx={{
                px: { xs: "10px", md: "20px" },
                height: "calc(100vh - 50px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6">{exam.name}</Typography>
                <Timer initialTime={timing} onTimeFinish={handleSubmitExam} />
            </Box>
            <Box sx={{ height: "calc(100% - 75px)", overflowY: "auto" }}>
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
                <Box>
                    <Alert sx={{ py: "0" }} severity="warning">
                        <Typography>
                            <strong>D</strong>onot refresh, else you will loss
                            you progress.
                        </Typography>
                        <Typography>
                            <strong>T</strong>he exam will be submitted only
                            once and this is done automatically as time elapses.
                        </Typography>
                        <Typography>
                            <strong>M</strong>ake sure you check your work
                            before submitting.
                        </Typography>
                    </Alert>
                </Box>
                <Button
                    disabled={formSubmitted}
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
