import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChatbotPage from "./pages/ChatbotPage";
import UploadMedicinePage from "./pages/UploadMedicinePage";
import UploadLabReportPage from "./pages/UploadLabReportPage";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/upload-medicine" element={<UploadMedicinePage />} />
        <Route path="/upload-lab-report" element={<UploadLabReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
