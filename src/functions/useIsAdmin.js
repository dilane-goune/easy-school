import { useLocation } from "react-router-dom";

export default function useIsAdmin() {
    const { pathname } = useLocation();
    return pathname.startsWith("/admin");
}
