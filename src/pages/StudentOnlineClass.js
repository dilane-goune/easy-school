import React, { useState } from "react";
import {
    Box,
    Typography,
    Divider,
    IconButton,
    TextField,
    Slider,
    CircularProgress,
    Backdrop,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Button,
} from "@mui/material";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PanToolIcon from "@mui/icons-material/PanTool";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import ChatMessage from "../components/ChatMessage";
import socket from "../functions/socket.io";
import globalContext from "../context/globalContext";
import SimpleInput from "../components/SimpleInput";
import { Peer } from "peerjs";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

export default function StudentOnlineClass() {
    const {
        appState: { user },
        feedBack,
    } = React.useContext(globalContext);

    const userName = user.name + " " + user.surName;
    const pp = user.pp;

    const videoRef = React.useRef({});
    const peerRef = React.useRef();
    const callRef = React.useRef();

    const { classId, teacherId } = useParams();

    const [isLoading, setIsLoading] = useState(true);

    const [selectedOption, setSelectedOption] = useState(0);

    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);

    const [participantSearch, setParticipantSearch] = useState("");
    const [messageSearch, setmessageSearch] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [isInClass, setIsInClass] = useState(false);

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

    function handleCanPlay() {
        videoRef.current.play();
    }

    React.useEffect(() => {
        const peer = new Peer(undefined, {
            host: "/",
            port: 8888,
            path: "/peerjs",
            debug: 2,
        });

        peer.on("error", console.log);

        peer.on("open", (id) => {
            // console.log(peerRef.current.id);
        });

        peer.on("call", (mediaConnection) => {
            // console.log("incoming call");
            callRef.current = mediaConnection;
            mediaConnection.answer();
            mediaConnection.on("error", (e) => {
                console.log(e);
            });

            mediaConnection.on("stream", (stream) => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            });
        });

        socket.on("new-user", (user) => {
            setParticipants((participants) => [...participants, user]);
        });
        socket.on("user-disconnect", (userId) => {
            setParticipants((participants) =>
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

        socket.on("teacher-disconnected", () => {
            alert("Teacher disconnected");
            setIsInClass(false);
        });

        socket.on("end-class", () => {
            alert("Teacher ended class");
            setIsInClass(false);
            callRef.current?.close();
        });

        peerRef.current = peer;

        setIsLoading(false);
    }, []);

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

    const handleJoinClasse = () => {
        if (peerRef.current) {
            socket.emit(
                "join-class",
                {
                    peerId: peerRef.current.id,
                    userName: user.name + " " + user.surName,
                    userId: user._id,
                    pp: user.pp,
                    classId,
                    teacherId,
                },
                (res) => {
                    if (res === null) {
                        alert("Teacher is not connected");
                    } else if (res === false) alert("Acces refused");
                    else if (res instanceof Array) {
                        setIsInClass(true);
                        setParticipants(res);
                    }
                }
            );
        } else alert("Connection not ready");
    };

    const handleQuitClass = () => {
        if (callRef.current) {
            callRef.current.close();
            socket.emit("quit-class", user._id);
            setIsInClass(false);
        }
    };

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff" }} open>
                <CircularProgress color="inherit" />{" "}
                <Typography> Please Wait...</Typography>
            </Backdrop>
        );

    return (
        <Box
            sx={{
                bgcolor: "lightgray",
            }}
        >
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "700px",
                    mx: "auto",
                    bgcolor: "#fdfdfd",
                }}
            >
                <video
                    onCanPlay={handleCanPlay}
                    autoPlay
                    ref={videoRef}
                    style={{
                        backgroundColor: "gray",
                        marginVertical: "2px",
                        maxHeight: "50vh",
                    }}
                ></video>
                <Box
                    sx={{
                        p: "2px 5px",
                        my: "2px",
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

                    <IconButton
                        size="small"
                        title={
                            videoRef.current?.paused
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

                    <Button
                        variant="outlined"
                        color="success"
                        onClick={
                            !isInClass ? handleJoinClasse : handleQuitClass
                        }
                        sx={{ borderRadius: "20px" }}
                        size="small"
                    >
                        {!isInClass ? "Join Class" : "Quit Class"}
                    </Button>

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

                <Divider />
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        border: "0px solid lightgrey",
                        borderRightWidth: {
                            sm: "1px",
                        },
                        minWidth: "49vw",
                    }}
                ></Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-around",
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
                        title="User"
                        color={selectedOption === 2 ? "primary" : "default"}
                        onClick={() => {
                            setSelectedOption(2);
                        }}
                    >
                        <PeopleAltIcon />
                    </IconButton>
                </Box>

                {selectedOption === 0 && (
                    <>
                        <Box>
                            <SimpleInput
                                placeholder="search"
                                value={messageSearch}
                                onChange={(e) =>
                                    setmessageSearch(e.target.value)
                                }
                            />
                        </Box>
                        <Box
                            sx={{
                                overflowY: "auto",
                                px: "5px",
                                flex: 1,
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
                        <TextField
                            multiline
                            maxRows={10}
                            placeholder="type a message"
                            sx={{
                                mx: "5px",
                                width: "calc(100% - 10px)",
                                mb: "3px",
                                borderRadius: "20px !important",
                                p: 0,
                            }}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <div style={{ position: "relative" }}>
                            <IconButton
                                disabled={!newMessage.trim()}
                                onClick={handleNewMessage}
                                color="primary"
                                size="small"
                                sx={{
                                    position: "absolute",
                                    bottom: "5px",
                                    right: "7px",
                                }}
                            >
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </>
                )}

                {selectedOption === 2 && (
                    <Box
                        sx={{
                            overflowY: "auto",
                            flex: 1,
                            minWidth: {
                                sm: "50vw",
                            },
                        }}
                    >
                        <SimpleInput
                            placeholder="search"
                            value={participantSearch}
                            onChange={(e) =>
                                setParticipantSearch(e.target.value)
                            }
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
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={
                                                        "/api/profile-pictures/" +
                                                        p.pp
                                                    }
                                                    alt={p.userName}
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                    }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={p.userName}
                                            />
                                        </ListItem>
                                    );
                                })}
                        </List>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
