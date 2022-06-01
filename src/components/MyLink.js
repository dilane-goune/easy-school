import React from "react";
import { Link } from "react-router-dom";

export default function MyLink({ to, label = "", bold = false }) {
    return (
        <Link
            to={to}
            style={{
                fontFamily: "Roboto",
                fontSize: "24px",
                fontWeight: bold ? "bold" : "normal",
            }}
        >
            {label}
        </Link>
    );
}
