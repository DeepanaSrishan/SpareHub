import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ScrollToTopButton from "../components/common/ScrollToTopButton";
import BikeAssemblyBackground from "../components/common/BikeAssemblyBackground";

export default function MainLayout() {
    const location = useLocation();

    // Home (/) has VehicleAssemblyBackground (Car)
    // Products (/products) has EngineAssemblyBackground (Engine)
    // All other pages in MainLayout render BikeAssemblyBackground (Powered by Car sequence)
    const isHome = location.pathname === "/";
    const isCatalog = location.pathname === "/products";
    const showBikeBg = !isHome && !isCatalog;

    return (
        <div className={showBikeBg ? "bike-page-layout-root" : ""}>
            {showBikeBg && <BikeAssemblyBackground />}
            <Navbar />
            <div className={showBikeBg ? "bike-page-content-wrapper" : ""}>
                <Outlet />
            </div>
            <ScrollToTopButton />
        </div>
    );
}
