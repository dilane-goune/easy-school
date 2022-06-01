import React from "react";

export const socketContext = React.createContext();

export default function SocketProvider({ children }) {
    const initialState = {
        notifications: [],
    };

    const [socketState, dispatchSocket] = React.useReducer((state, action) => {
        if (action.type === "NEW_NOTIFICATION")
            return {
                ...state,
                notifications: [...state.notifications, action.notification],
            };
        throw new Error("No dispatch match");
    }, initialState);

    return (
        <socketContext.Provider value={{ socketState, dispatchSocket }}>
            {children}
        </socketContext.Provider>
    );
}
