import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import ChatbotPage from "./pages/ChatbotPage";
import UploadMedicinePage from "./pages/UploadMedicinePage";
import UploadLabReportPage from "./pages/UploadLabReportPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SkinDiseasePage from "./pages/SkinDiseasePage";
import BodyMapPage from "./pages/BodyMapPage";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/upload-medicine" element={<UploadMedicinePage />} />
          <Route path="/upload-lab-report" element={<UploadLabReportPage />} />
          <Route path="/skin-detector" element={<SkinDiseasePage />} />
          <Route path="/body-map" element={<BodyMapPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
