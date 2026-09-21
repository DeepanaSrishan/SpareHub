import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ScrollToTopButton from "../components/common/ScrollToTopButton";

export default function MainLayout() {
    return (
        <>
            <Navbar />
            <Outlet />
            <ScrollToTopButton />
        </>
    );
}
