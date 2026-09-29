import { useState } from "react";
import BikeLoginAssemblyBackground from "../../components/showroom/BikeLoginAssemblyBackground";
import ShowroomHUD from "../../components/showroom/ShowroomHUD";
import ShowroomAuthCard from "../../components/showroom/ShowroomAuthCard";
import "../../styles/showroom-3d.css";
import "../../styles/bike-assembly-scroll.css";

export default function LoginPage() {
  const [isAuthCardOpen, setIsAuthCardOpen] = useState(true);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  const handleExploreParts = () => {
    setIsAuthCardOpen(false);
  };

  const handleOpenSignIn = () => {
    setIsAuthCardOpen(true);
  };

  return (
    <main
      className="showroom-root"
      role="main"
      aria-label="SpareHub Motorcycle Assembly & Login"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "#0c1013",
      }}
    >
      {/* 1. Cinematic Motorcycle Assembly Canvas Sequence from /bik/ frames */}
      <BikeLoginAssemblyBackground
        onOpenSignIn={handleOpenSignIn}
        onExploreParts={handleExploreParts}
        isAuthCardOpen={isAuthCardOpen}
      />

      {/* 2. Showroom Top Navbar, Headlines, and Tooltip */}
      <ShowroomHUD
        onOpenSignIn={handleOpenSignIn}
        onExploreParts={handleExploreParts}
        hoveredPart={hoveredPart}
        tooltipPos={tooltipPos}
      />

      {/* 3. Floating / Docked Sign In Card */}
      <ShowroomAuthCard
        isOpen={isAuthCardOpen}
        onClose={() => setIsAuthCardOpen(false)}
      />
    </main>
  );
}