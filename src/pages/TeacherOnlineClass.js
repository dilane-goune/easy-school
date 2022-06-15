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
    Slider,
    Backdrop,
    CircularProgress,
    Container,
} from "@mui/material";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PanToolIcon from "@mui/icons-material/PanTool";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DuoIcon from "@mui/icons-material/Duo";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import MicOffIcon from "@mui/icons-material/MicOff";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import TopicIcon from "@mui/icons-material/Topic";
import ChatMessage from "../components/ChatMessage";
import socket from "../functions/socket.io";
import globalContext from "../context/globalContext";
import { Peer } from "peerjs";
import SimpleInput from "../components/SimpleInput";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

export default function TeacherOnlineClass() {
    const {
        appState: { user },
        feedBack,
    } = React.useContext(globalContext);

    const userName = user.name + " " + user.surName;
    const pp = user.pp;

    const { courseCode, classId, courseName } = useParams();

    const videoRef = React.useRef();
    const [stream, setStream] = useState();
    // const streamRef = React.useRef();
    const peerRef = React.useRef();
    const callRef = React.useRef();

    const [videoOptions, setVideoOptions] = useState({
        video: true,
        audio: true,
    });

    // const mediaStream = useUserMedia(videoOptions);

    const [isLoading, setIsLoading] = useState(true);

    const [classStarted, setClassStarted] = useState(false);
    const [mediaError, setMediaError] = useState(false);

    const [selectedOption, setSelectedOption] = useState(0);

    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);

    const [participantSearch, setParticipantSearch] = useState("");
    const [messageSearch, setmessageSearch] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [showControls, setShowControls] = useState(false);

    function handleCanPlay() {
        videoRef.current.play();
    }

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
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                setStream(stream);

                const peer = new Peer(undefined, {
                    host: "/",
                    port: 8888,
                    path: "/peerjs",
                    debug: 2,
                });
                peer.on("error", console.log);
                // peer.on("open", (id) => setNewMessage(id));

                peerRef.current = peer;

                socket.on("join-request", ({ peerId, userName }, callBack) => {
                    console.log("join-request => ", userName, peerId);
                    const res = window.confirm(
                        userName + " want to join the class"
                    );
                    if (res) {
                        callBack(true);

                        peerRef.current.call(peerId, stream);
                    } else callBack(false);
                });

                socket.on("new-user", (user) => {
                    setParticipants([...participants, user]);
                });
                socket.on("user-disconnect", (userId) => {
                    setParticipants(
                        participants.filter((p) => p.userId !== userId)
                    );
                });

                socket.on("new-message", ({ userName, message, pp }) => {
                    setMessages((messages) => [
                        ...messages,
                        {
                            userName,
                            message,
                            pp,
                            time: dayjs().format("HH : mm A"),
                        },
                    ]);
                });

                socket.on("disconnect", () => {
                    console.log("diconnected");
                    setClassStarted(false);
                    peerRef.current?.close();
                });

                setIsLoading(false);
            })
            .catch((e) => {
                console.log(e);
                setIsLoading(false);
                setMediaError(true);
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (stream && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setShowControls(true);
        }
    }, [stream]);

    const toggleVideoSource = () => {
        if (stream) {
            setVideoOptions({ ...videoOptions, video: !videoOptions.video });
            stream.getVideoTracks().forEach((t) => {
                if (t.readyState === "live") t.enabled = !t.enabled;
            });
        }
    };
    const toggleAudioSource = () => {
        if (stream) {
            setVideoOptions({ ...videoOptions, audio: !videoOptions.audio });
            stream.getAudioTracks().forEach((t) => {
                if (t.readyState === "live") t.enabled = !t.enabled;
            });
        }
    };

    const handleNewMessage = () => {
        socket.emit("message", { userName, message: newMessage, pp }, (res) => {
            if (res) {
                setMessages([
                    ...messages,
                    {
                        userName,
                        message: newMessage,
                        pp,
                        time: dayjs().format("HH : mm A"),
                        isMe: true,
                    },
                ]);
                setNewMessage("");
            } else feedBack("Message not sent");
        });
    };

    const removeParticipant = () => {};

    const handleEndClasse = () => {
        socket.emit("end-class", (res) => {
            if (res) {
                setClassStarted(false);
                callRef.current?.close();
                console.log(res);
            }
        });
    };

    const handleStartClasse = () => {
        socket.emit(
            "start-class",
            {
                userId: user._id,
                classId,
                courseCode,
                peerId: peerRef.current.id,
                userName,
                pp: user.pp,
            },
            (res) => {
                if (res === "OK") setClassStarted(true);
                setParticipants([
                    {
                        userName,
                        _id: user._id,
                        pp: user.pp,
                        isTeacher: true,
                    },
                ]);
            }
        );
    };

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff" }} open>
                <CircularProgress color="inherit" />{" "}
                <Typography> Please Wait...</Typography>
            </Backdrop>
        );

    if (mediaError)
        return (
            <Container>
                <Typography variant="h4" sx={{ textAlign: "center" }}>
                    Failed to get Media.
                </Typography>
                {[
                    "May be your browser don't support this functionality",
                    "Make sure your device have a webcam",
                    "Make sure you grant permission to access video and audio for this site",
                ].map((text, ind) => (
                    <Typography key={ind}>{text}</Typography>
                ))}
            </Container>
        );

    return (
        <Grid
            container
            sx={{
                "& .MuiPaper-root": {
                    m: "0px 1px",
                },
                height: "100vh",
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
                    <SimpleInput
                        placeholder="search"
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                    />
                    <List disablePadding>
                        {participants
                            .filter((p) =>
                                participantSearch
                                    ? p?.userName
                                          .toLowerCase()
                                          .includes(participantSearch)
                                    : true
                            )
                            .map((p, ind) => {
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
                                                onClick={() =>
                                                    removeParticipant(p._id)
                                                }
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
                                                src={
                                                    "/api/profile-pictures/" +
                                                    p.pp
                                                }
                                                alt={p.userName}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText primary={p.userName} />
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
                                {courseName}
                            </Typography>
                        </Box>
                        <IconButton size="small">
                            <SettingsIcon />
                        </IconButton>
                    </Paper>
                    <React.StrictMode>
                        <video
                            onCanPlay={handleCanPlay}
                            autoPlay
                            width="100%"
                            height="70%"
                            ref={videoRef}
                            style={{
                                backgroundColor: "gray",
                                borderRadius: "5px",
                                marginVertical: "2px",
                            }}
                        >
                            Loading...
                        </video>
                    </React.StrictMode>
                    {showControls && (
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
                            <Box sx={{ display: "flex" }}>
                                <IconButton
                                    size="small"
                                    title={
                                        videoOptions.video
                                            ? "enable video"
                                            : "disable video"
                                    }
                                    onClick={toggleVideoSource}
                                >
                                    {videoOptions.video ? (
                                        <VideocamIcon />
                                    ) : (
                                        <VideocamOffIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    size="small"
                                    title={
                                        videoOptions.audio
                                            ? "enable audio"
                                            : "disable audio"
                                    }
                                    onClick={toggleAudioSource}
                                >
                                    {!videoOptions.audio ? (
                                        <MicIcon />
                                    ) : (
                                        <MicOffIcon />
                                    )}
                                </IconButton>

                                <IconButton
                                    size="small"
                                    title={
                                        videoRef.current.paused
                                            ? "play video"
                                            : "pause video"
                                    }
                                    onClick={() => {
                                        if (videoRef.current.paused) {
                                            videoRef.current.play();
                                        } else {
                                            videoRef.current.pause();
                                        }
                                    }}
                                >
                                    {videoRef.current.paused ? (
                                        <PauseCircleOutlineIcon />
                                    ) : (
                                        <PlayCircleOutlineIcon />
                                    )}
                                </IconButton>
                                <Box
                                    sx={{
                                        width: "150px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <VolumeDown />
                                    <Slider
                                        onChange={(e, val) => {
                                            videoRef.current.volume = val / 100;
                                        }}
                                        // orientation="vertical"
                                        defaultValue={50}
                                        sx={{
                                            "& .MuiSlider-track": {
                                                border: "none",
                                            },
                                            "& .MuiSlider-thumb": {
                                                width: 12,
                                                height: 12,
                                                backgroundColor: "#fff",
                                            },
                                            // height: 12,
                                            p: "0",
                                            mx: "4px",
                                        }}
                                    />
                                    <VolumeUp />
                                </Box>
                            </Box>
                            <Box>
                                {
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        onClick={
                                            !classStarted
                                                ? handleStartClasse
                                                : handleEndClasse
                                        }
                                        sx={{ borderRadius: "20px" }}
                                        size="small"
                                    >
                                        {!classStarted
                                            ? "Start Class"
                                            : "End Class"}
                                    </Button>
                                }
                            </Box>
                            <Box>
                                <IconButton
                                    size="small"
                                    title="take a break"
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
                    )}
                    <Paper
                        sx={{
                            flex: "1 1 auto",
                            flexDirection: "column",
                            display: "flex",
                            p: "2px 5px",
                        }}
                    >
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
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        ></textarea>
                        <div style={{ position: "relative" }}>
                            <IconButton
                                disabled={!newMessage.trim()}
                                onClick={handleNewMessage}
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
                            justifyContent: "space-around",

                            mb: "5px",
                            px: "5px",
                        }}
                    >
                        <IconButton
                            size="small"
                            title="Chat"
                            color={selectedOption === 0 ? "primary" : "default"}
                            onClick={() => {
                                setSelectedOption(0);
                            }}
                        >
                            <ChatIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            title="Documents"
                            color={selectedOption === 1 ? "primary" : "default"}
                            onClick={() => {
                                setSelectedOption(1);
                            }}
                        >
                            <TopicIcon />
                        </IconButton>
                    </Box>
                    {selectedOption === 0 && (
                        <>
                            <SimpleInput
                                placeholder="search"
                                value={messageSearch}
                                onChange={(e) =>
                                    setmessageSearch(e.target.value)
                                }
                            />
                            <Box
                                sx={{
                                    maxHeight: "calc(100% - 50px)",
                                    overflowY: "auto",
                                    px: "5px",
                                }}
                            >
                                {messages
                                    .filter((m) =>
                                        messageSearch
                                            ? m?.message
                                                  .toLowerCase()
                                                  .includes(messageSearch)
                                            : true
                                    )
                                    .map((m, ind) => (
                                        <ChatMessage key={ind} {...m} />
                                    ))}
                            </Box>
                        </>
                    )}
                    {selectedOption === 1 && (
                        <Box>
                            <Typography>Documents</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
}
