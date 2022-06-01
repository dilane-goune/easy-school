/* eslint-disable react-hooks/exhaustive-deps */
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

dayjs.extend(LocalizedFormat);
dayjs.extend(RelativeTime);

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
                        const formatedDate = (
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
                                    if (exam.hasPassed)
                                        return navigate(
                                            "/exams/result/" + exam._id
                                        );

                                    if (isTeacher) return handleCancelExam();

                                    navigate("/exams/write/" + exam._id);
                                }}
                                size="small"
                            >
                                {exam.hasPassed
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
