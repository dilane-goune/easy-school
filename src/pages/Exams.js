import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { Button, Typography, Container } from "@mui/material";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";
import { useNavigate } from "react-router-dom";
import timeGenerator from "../functions/timeGenerator";

dayjs.extend(LocalizedFormat);
dayjs.extend(RelativeTime);

const Timer = ({ initialtime }) => {
    const [time, setTime] = useState({
        ...timeGenerator(initialtime),
        value: initialtime,
    });
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (time.value >= 100) {
                setTime({
                    ...timeGenerator(time.value),
                    value: time.value - 1000,
                });
            } else clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [time]);

    return (
        <Typography sx={{ color: "warning.main" }}>
            today{" "}
            <em>{`${parseInt(time.hours) > 1 ? time.hours + "hrs, " : ""} ${
                time.minutes
            } min and ${time.seconds + " sec"}`}</em>{" "}
            left
        </Typography>
    );
};

export default function Exams() {
    const [exams, setExams] = useState([]);

    const {
        feedBack,
        appState: {
            user: { isTeacher, classId },
        },
    } = React.useContext(globalContext);

    const navigate = useNavigate();

    React.useEffect(() => {
        fetchData(`/api/exams${isTeacher ? "" : "?classId=" + classId}`).then(
            (data) => {
                if (data instanceof Array) setExams(data);
                else feedBack("Failed to fetch data");
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancelExam = () => {
        alert("exam cancelled");
    };

    return (
        <Container>
            <PageHeader title="Exams" />
            <Typography>Exam</Typography>
            <Table
                headData={[
                    { label: "Class", key: "className" },
                    { label: "Name", key: "name" },
                    {
                        label: "Date",
                        key: "formatedDate",
                        sx: { minWidth: "160px" },
                    },
                    {
                        label: "Duration",
                        key: "formatedDuration",
                        sx: { minWidth: "80px" },
                    },
                    {
                        label: "Course",
                        key: "courseName",
                    },
                    { label: "Action", key: "action" },
                ]}
                data={exams
                    // .concat(exams, exams, exams, exams, exams, exams)
                    .map((exam) => {
                        const formatedDuration = `${parseInt(
                            exam.duration
                        )} hrs : ${
                            (exam.duration - parseInt(exam.duration)) * 60
                        } min`;
                        // if () {
                        // }
                        const remainingTime = dayjs(exam.date) - dayjs();

                        const formatedDate =
                            remainingTime / 1000 / 60 / 60 <= 1 &&
                            remainingTime > 0 ? (
                                <Timer initialtime={remainingTime} />
                            ) : (
                                <Typography
                                    sx={{
                                        color: exam.hasPassed
                                            ? "info.main"
                                            : exam.hasStarted
                                            ? "success.main"
                                            : "warning.main",
                                    }}
                                >
                                    {`${dayjs(exam.date).format("lll")}, `}
                                    <em>{dayjs().to(exam.date)}</em>
                                </Typography>
                            );
                        const action = (
                            <Button
                                disabled={
                                    exam.hasPassed
                                        ? false
                                        : isTeacher
                                        ? exam.hasStarted
                                        : !exam.hasStarted
                                }
                                onClick={() => {
                                    if (exam.isWritten)
                                        return navigate(
                                            "/exams/result/" + exam._id
                                        );

                                    if (isTeacher) return handleCancelExam();

                                    navigate("/exams/write/" + exam._id);
                                }}
                                size="small"
                            >
                                {exam.isWritten
                                    ? "Result"
                                    : isTeacher
                                    ? "Cancel"
                                    : "Start"}
                            </Button>
                        );
                        return {
                            ...exam,
                            formatedDate,
                            action,
                            formatedDuration,
                        };
                    })}
                numbered
                asPage
                small
            />
        </Container>
    );
}
