import React from "react";
import { useLocation } from "react-router-dom";

function ErrorPage() {
    const { search } = useLocation();
    const message = new URLSearchParams(search).get("message");
    return (
        <div>
            <center>
                <h2>ErrorPage</h2>
            </center>
            <br />
            <br />
            <center>
                <h4>{message}</h4>
            </center>
        </div>
    );
}

export default ErrorPage;
