import React from "react";
import PropTypes from "prop-types";
import { Box, Avatar, Typography, Divider } from "@mui/material";

function ChatMessage(props) {
    const { isMe = false, profile, userName, message, time } = props;
    return (
        <Box
            sx={{
                display: "flex",
                mb: "5px",
                flexDirection: isMe ? "row" : "row-reverse",
            }}
        >
            <Avatar
                alt={userName}
                src={profile}
                sx={{ width: 24, height: 24 }}
            />
            <Box
                sx={{
                    ml: isMe ? "02px" : "30px",
                    mr: isMe ? "30px" : "02px",
                    p: "3px",
                    lineHeight: "15px",
                    bgcolor: isMe ? "#f0ecec" : "#03a9f4",
                    borderRadius: "10px",
                    borderTopLeftRadius: isMe ? "0" : "10px",
                    borderTopRightRadius: isMe ? "10px" : "0",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mr: "5px",
                    }}
                >
                    <Typography
                        sx={{ mr: "10px" }}
                        display="inline"
                        variant="caption"
                    >
                        {userName}
                    </Typography>
                    <Typography display="inline" variant="caption">
                        <em>{time}</em>
                    </Typography>
                </Box>
                <Divider />
                <Typography sx={{ opacity: 0.85 }} variant="body2">
                    {message}
                </Typography>
            </Box>
        </Box>
    );
}

ChatMessage.propTypes = {
    isMe: PropTypes.bool,
    profile: PropTypes.string,
    userName: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
};

ChatMessage.defaultProps = {
    isMe: false,
};

export default React.memo(ChatMessage);
