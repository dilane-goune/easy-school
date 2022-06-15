import React, { useState } from "react";
import Select from "../../components/Select";
import MyDialog from "../../components/MyDialog";
import Input from "../../components/Input";
import { ReactSortable } from "react-sortablejs";
import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UpdateCourseDialog({
    originalCourse,
    open,
    onClose,
    onSave,
}) {
    const [course, setCourse] = useState(originalCourse);
    const [newChapter, setNewChapter] = useState("");
    const [courseChapters, setCourseChapters] = useState(
        originalCourse.chapters.map((c, ind) => ({ id: ind, name: c }))
    );

    return (
        <MyDialog
            title={"Update " + course.name + " (" + course.courseCode + ")"}
            fullScreen
            open={open}
            onClose={onClose}
            actionButtons={[
                { label: "Cancel", onClick: onclose },
                {
                    label: "Save",
                    onClick: () => {
                        onSave({ ...course, chapters: courseChapters });
                    },
                },
            ]}
        >
            <Box px="30px" py="10px">
                <Box display="flex">
                    <Input
                        value={course.name}
                        onChange={(val) =>
                            setCourse({
                                ...course,
                                name: val,
                            })
                        }
                        sx={{ my: "5px", flex: 1 }}
                        label="Course Name"
                    />
                    <Select
                        width="20%"
                        sx={{ m: "5px" }}
                        options={["L1", "L2", "L3", "M1", "M2"]}
                        label="Level"
                        onChange={(val) => {
                            setCourse({
                                ...course,
                                level: val,
                            });
                        }}
                        value={course.level}
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
                            padding: "10px 5px",
                            boxSizing: "border-box",
                            fontFamily: "Roboto",
                            fontSize: "16px",
                        }}
                        value={newChapter}
                        onChange={(e) => setNewChapter(e.target.value)}
                        placeholder="new chapter"
                        className="new-chapter-input"
                        onKeyDown={(e) => {
                            if (newChapter.trim() !== "" && e.key === "Enter") {
                                if (
                                    courseChapters.find(
                                        (nw) => nw.name === newChapter.trim()
                                    )
                                ) {
                                    setNewChapter("");
                                    return;
                                }
                                setCourseChapters([
                                    ...courseChapters,
                                    {
                                        id: courseChapters.length + 1,
                                        name: newChapter.trim(),
                                    },
                                ]);
                                setNewChapter("");
                            }
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        // maxHeight: "270px",
                        overflowY: "auto",
                    }}
                >
                    <ReactSortable
                        list={courseChapters}
                        setList={setCourseChapters}
                    >
                        {courseChapters.map((item, ind) => (
                            <Box
                                key={ind}
                                sx={{
                                    display: "flex",
                                    border: "1px solid #ada8a8",
                                    justifyContent: "space-between",
                                    p: "8px 10px",
                                    mb: "5px",
                                    cursor: "grab",

                                    "& .MuiSvgIcon-root": {
                                        display: "none",
                                    },
                                    "&:hover .MuiSvgIcon-root": {
                                        color: "red",
                                        display: "initial",
                                    },
                                }}
                            >
                                <Typography variant="body1">
                                    {ind + 1 + ". " + item?.name}
                                </Typography>
                                <DeleteIcon
                                    onClick={() => {
                                        setCourseChapters(
                                            courseChapters.filter(
                                                (c) => c?.id !== item?.id
                                            )
                                        );
                                    }}
                                />
                            </Box>
                        ))}
                    </ReactSortable>
                </Box>
            </Box>
        </MyDialog>
    );
}
