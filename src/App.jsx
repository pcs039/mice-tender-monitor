import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Pipeline from "./components/Pipeline";
import DashboardPreview from "./components/DashboardPreview";
import Value from "./components/Value";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";

function App() {
  const [currentView, setView] = useState("dashboard"); // Default to the dashboard view

  return (
    <div className="relative min-h-screen bg-brand-bg text-[#E2E8F0] font-sans overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
      {/* Dynamic glow decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent z-40 pointer-events-none" />
      
      {/* Sticky header navigation */}
      <Navbar currentView={currentView} setView={setView} />
      
      {/* Conditionally render internal Dashboard vs public landing page */}
      {currentView === "dashboard" ? (
        <Dashboard />
      ) : (
        <>
          <main>
            <Hero />
            <Problem />
            <Pipeline />
            <DashboardPreview />
            <Value />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}


export default App;
