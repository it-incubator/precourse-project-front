import { Routes, Route } from "react-router-dom";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectPage from "./pages/ProjectPage";
import Header from "./components/Header";

export default function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectPage />} />
            </Routes>
        </>
    );
}