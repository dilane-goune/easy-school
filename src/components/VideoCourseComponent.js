import React, { useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Button,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
} from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PanToolIcon from "@mui/icons-material/PanTool";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DuoIcon from "@mui/icons-material/Duo";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import TopicIcon from "@mui/icons-material/Topic";
import ChatMessage from "./ChatMessage";
import socket from "../functions/socket.io";
import globalContext from "../context/globalContext";

export default function VideoCourseComponent() {
    const {
        appState: { user },
    } = React.useContext(globalContext);

    const videoRef = React.useRef();

    const [streamState, setStreamState] = useState({
        video: true,
        audio: true,
    });
    const [controlState, setControlState] = useState({
        paused: false,
        muted: false,
    });

    const askQuestion = () => {
        socket.emit("ask-question", {
            userId: user._id,
            userName: user.name + " " + user.surName,
        });
    };
    const askPermission = () => {
        socket.emit(
            "ask-permission",
            {
                userId: user._id,
                userName: user.name + " " + user.surName,
            },
            () => {
                console.log("permission granted");
            }
        );
    };

    React.useEffect(() => {
        window.navigator.mediaDevices
            .getUserMedia(streamState)
            .then((stream) => {
                videoRef.current.srcObject = stream;
                videoRef.current.autoplay = true;
            })
            .catch(console.log);
    }, [streamState]);

    return (
        <Grid
            xl
            container
            sx={{
                "& .MuiPaper-root": {
                    m: "0px 1px",
                },
            }}
        >
            <Grid
                item
                xs={3}
                lg={2.5}
                sx={{
                    height: "100vh",
                    pr: "2px",
                    "& *": {
                        boxSizing: "border-box !important",
                    },
                }}
            >
                <Paper
                    sx={{
                        p: "5px",
                        "& *": {
                            verticalAlign: "middle",
                        },
                        height: "100%",
                        overflowY: "auto",
                        boxSizing: "border-box",
                    }}
                >
                    <Box
                        sx={{
                            px: "20px",
                            "& *": {
                                verticalAlign: "middle",
                            },
                        }}
                    >
                        <PeopleAltIcon color="info" />
                        <Typography
                            // variant="h6"
                            sx={{ display: "inline", ml: "10px" }}
                        >
                            <strong>Participants</strong>
                        </Typography>
                    </Box>
                    <input
                        placeholder="search"
                        style={{
                            flex: 1,
                            border: "1px solid lightgray",
                            borderRadius: "20px",
                            width: "100%",
                            padding: "5px",
                            boxSizing: "border-box",
                            textAlign: "center",
                        }}
                    />
                    <List disablePadding>
                        {"hellos".split("").map((t, ind) => {
                            return (
                                <ListItem
                                    disablePadding
                                    disableGutters
                                    sx={{
                                        my: "4px",
                                        "&:hover .MuiButton-root": {
                                            display: "initial",
                                        },
                                    }}
                                    key={ind}
                                    secondaryAction={
                                        <Button
                                            // variant="outlined"
                                            size="small"
                                            sx={{
                                                borderRadius: "20px",
                                                display: "none",
                                            }}
                                        >
                                            remove
                                        </Button>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            alt="D"
                                            sx={{ width: 24, height: 24 }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={"User " + (ind + 1)}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Paper>
            </Grid>
            <Grid item xs={6} lg={6.5} sx={{ height: "100vh" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexFlow: "column",
                        height: "100%",
                    }}
                >
                    <Paper
                        sx={{
                            p: "5px 20px",
                            "& *": {
                                verticalAlign: "middle",
                            },
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box>
                            <DuoIcon color="success" fontSize="large" />
                            <Typography
                                variant="h6"
                                sx={{ display: "inline", ml: "10px" }}
                            >
                                Algorithm 1
                            </Typography>
                        </Box>
                        <IconButton size="small">
                            <SettingsIcon />
                        </IconButton>
                    </Paper>
                    <video
                        muted={controlState.muted}
                        width="100%"
                        height="70%"
                        ref={videoRef}
                        style={{
                            backgroundColor: "gray",
                            borderRadius: "5px",
                            marginVertical: "2px",
                        }}
                    ></video>
                    <Box
                        sx={{
                            p: "2px 5px",
                            borderRadius: "5px",
                            "& .MuiIconButton-root": {
                                border: "1px solid lightgrey",
                                mx: "5px",
                            },

                            "& .MuiSvgIcon-root": {
                                fontSize: "20px",
                            },
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box>
                            <IconButton
                                size="small"
                                title={
                                    streamState.audio
                                        ? "disable audio"
                                        : "enable audio"
                                }
                                onClick={() => {
                                    setStreamState({
                                        ...streamState,
                                        audio: !streamState.audio,
                                    });
                                }}
                            >
                                {streamState.audio ? (
                                    <MicIcon />
                                ) : (
                                    <MicOffIcon />
                                )}
                            </IconButton>
                            <IconButton
                                size="small"
                                title={
                                    streamState.video
                                        ? "disable video"
                                        : "enable video"
                                }
                                onClick={() => {
                                    setStreamState({
                                        ...streamState,
                                        video: !streamState.video,
                                    });
                                }}
                            >
                                {streamState.video ? (
                                    <VideocamIcon />
                                ) : (
                                    <VideocamOffIcon />
                                )}
                            </IconButton>
                            <IconButton
                                size="small"
                                title={
                                    controlState.muted
                                        ? "unmute video"
                                        : "mute video"
                                }
                                onClick={() => {
                                    setControlState({
                                        ...controlState,
                                        muted: !controlState.muted,
                                    });
                                }}
                            >
                                {controlState.muted ? (
                                    <VolumeOffIcon />
                                ) : (
                                    <VolumeUpIcon />
                                )}
                            </IconButton>

                            <IconButton
                                size="small"
                                title={
                                    controlState.paused
                                        ? "play video"
                                        : "pause video"
                                }
                                onClick={() => {
                                    if (videoRef.current.paused) {
                                        videoRef.current.play();
                                    } else {
                                        videoRef.current.pause();
                                    }
                                    setControlState({
                                        ...controlState,
                                        paused: !controlState.paused,
                                    });
                                }}
                            >
                                {controlState.paused ? (
                                    <PauseCircleOutlineIcon />
                                ) : (
                                    <PlayCircleOutlineIcon />
                                )}
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton
                                sx={{ "&:hover": { bgcolor: "lightgray" } }}
                                color="primary"
                                size="small"
                                title="end class"
                            >
                                <CallEndIcon color="error" />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton
                                size="small"
                                title="ask permission"
                                onClick={askPermission}
                            >
                                <DirectionsRunIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                title="ask a question"
                                onClick={askQuestion}
                            >
                                <PanToolIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Paper
                        sx={{
                            flex: "1 1 auto",
                            flexDirection: "column",
                            display: "flex",
                            p: "2px 5px",
                        }}
                    >
                        <Box sx={{ mb: "10px" }}>
                            {"12".split("").map((s, ind) => (
                                <Box
                                    key={ind}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography
                                        variant="subtile2"
                                        sx={{ display: "inline" }}
                                    >
                                        <strong>Tayou</strong> is asking for
                                        permission
                                    </Typography>

                                    <Button sx={{ p: 0 }} size="small">
                                        grant
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                        <textarea
                            style={{
                                flex: 1,
                                border: "1px solid lightgray",
                                borderRadius: "10px",
                                width: "100%",
                                padding: "5px",
                                boxSizing: "border-box",
                                resize: "none",
                            }}
                            placeholder="Type your message."
                        ></textarea>
                        <div style={{ position: "relative" }}>
                            <IconButton
                                color="primary"
                                size="small"
                                sx={{
                                    position: "absolute",
                                    top: "-30px",
                                    right: "5px",
                                }}
                            >
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={3} sx={{ height: "100vh", pl: "2px" }}>
                <Paper sx={{ height: "100%" }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            "& .MuiButton-root": {
                                borderWidth: "0px",
                                borderBottomWidth: "2px",
                                borderRadius: 0,
                            },
                            mb: "5px",
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <ChatIcon color="primary" fontSize="small" />
                            }
                        >
                            Chat
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                <TopicIcon color="text" fontSize="small" />
                            }
                        >
                            Documents
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            maxHeight: "calc(100% - 50px)",
                            overflowY: "auto",
                        }}
                    >
                        <ChatMessage
                            isMe
                            userName="Patrick Kene"
                            message="Hello guys. How far?"
                            time="09:30 AM"
                            profile={require("../assets/images/male.jpg")}
                        />
                        <ChatMessage
                            userName="Nelly Ngeupa"
                            message="Hi Patrick. We are doing well and you?"
                            time="09:32 AM"
                        />
                        <ChatMessage
                            isMe
                            userName="Patrick Kene"
                            message="Hello guys. How far?"
                            time="09:30 AM"
                            profile={require("../assets/images/male.jpg")}
                        />
                        <ChatMessage
                            userName="Nelly Ngeupa"
                            message="Hi Patrick. We are doing well and you?"
                            time="09:32 AM"
                        />
                        <ChatMessage
                            isMe
                            userName="Patrick Kene"
                            message="Hello guys. How far?"
                            time="09:30 AM"
                            profile={require("../assets/images/male.jpg")}
                        />
                        <ChatMessage
                            userName="Nelly Ngeupa"
                            message="Hi Patrick. We are doing well and you?"
                            time="09:32 AM"
                        />
                        <ChatMessage
                            userName="Nelly Ngeupa"
                            message="Hi Patrick. We are doing well and you?"
                            time="09:32 AM"
                        />
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}
