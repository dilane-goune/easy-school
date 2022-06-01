import React from "react";
import { io } from "socket.io-client";

const socket = io();

export default function useSocket(appState, dispatchApp) {
    React.useEffect(() => {
        if (appState.user._id) {
            socket.emit(
                "student-login",
                { userId: appState.user._id },
                (data) => {
                    console.log(data);
                }
            );

            socket.on("connect", () => {
                console.log(socket.id);
            });
        }
    }, [appState]);
}
