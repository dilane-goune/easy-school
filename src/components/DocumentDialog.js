import React from "react";
import MyDialog from "./MyDialog";
import Input from "./Input";
import { TextField, Box, Typography, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function AssignmentDialog({
    open,
    onClose,
    onSave,
    saveTitle = "save",
}) {
    const [files, setFiles] = React.useState([]);
    const [title, setTitle] = React.useState("");
    const [body, setBody] = React.useState("");

    const inputRef = React.useRef();

    const theme = useTheme();
    const isXS = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <MyDialog
            title="Course Documents"
            fullScreen
            open={open}
            onClose={onClose}
            actionButtons={[
                { label: "Cancel", onClick: onClose },
                {
                    label: saveTitle,
                    onClick: () => {
                        onSave({ files, title, body });
                    },
                    disabled: !(title && (body || files.length)),
                },
            ]}
            helperText={`This could be video, pdf, audio ... `}
        >
            <Box component="form" sx={{ m: "auto" }}>
                <Input
                    label="Title"
                    value={title}
                    onChange={(val) => setTitle(val)}
                />
                <br />
                <TextField
                    minRows={4}
                    maxRows={10}
                    label="Body"
                    fullWidth
                    multiline
                    sx={{ borderRadius: "50px" }}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <Typography sx={{ mt: "10px" }}> Files</Typography>
                <Box sx={{ mt: "1px", display: "flex" }}>
                    <Box sx={{ flex: 1 }}>
                        {files.length === 0 && (
                            <Typography
                                variant="h5"
                                sx={{ textAlign: "center" }}
                            >
                                Add some files
                            </Typography>
                        )}
                        {files.length > 0 &&
                            files.map((f, ind) => (
                                <Box
                                    key={ind}
                                    sx={{
                                        display: "flex",
                                        border: "1px solid #ada8a8",
                                        justifyContent: "space-between",
                                        p: "0 5px 0 10px",
                                        mb: "5px",
                                        mr: "5px",

                                        "& *": {
                                            my: "auto",
                                        },
                                        "&:hover .MuiSvgIcon-root": {
                                            color: "error.main",
                                            display: "initial",
                                            ml: "10px",
                                        },
                                        flex: 1,
                                        borderRadius: "5px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            flex: 1,
                                            // width: "calc(100% - 30px)",
                                        }}
                                    >
                                        <Typography variant="h6">
                                            {ind + 1 + ". " + f.name}
                                        </Typography>
                                        <Typography variant="body1">
                                            {f.type}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={() =>
                                            setFiles(
                                                files.filter(
                                                    (file) =>
                                                        file.name !== f.name &&
                                                        file.type !== f.type
                                                )
                                            )
                                        }
                                        size="small"
                                    >
                                        <DeleteIcon sx={{ my: "auto" }} />
                                    </IconButton>
                                </Box>
                            ))}
                    </Box>
                    <input
                        onChange={(e) => {
                            setFiles([...files, ...e.currentTarget.files]);
                            console.log(
                                e.currentTarget.files[0].name,
                                e.currentTarget.files[0].type
                            );
                        }}
                        type="file"
                        multiple
                        hidden
                        ref={inputRef}
                    />
                    <Button
                        title="add files"
                        startIcon={isXS && <AttachFileIcon />}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: "20px" }}
                        onClick={() => {
                            inputRef.current?.click();
                        }}
                    >
                        {!isXS && "Add File"}
                    </Button>
                </Box>
            </Box>
        </MyDialog>
    );
}
