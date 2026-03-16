import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AllStudies from "./pages/AllStudies";
import Grants from "./pages/Grants";
import Tasks from "./pages/Tasks";
import Publications from "./pages/Publications";
import StudyDetail from "./pages/StudyDetail";

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/studies" element={<AllStudies />} />
              <Route path="/studies/:id" element={<StudyDetail />} />
              <Route path="/grants" element={<Grants />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/publications" element={<Publications />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
