import { BrowserRouter, Routes, Route,useLocation } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx';
import HomePage from "./pages/HomePage";
import FlipbookViewer from "./pages/PdfFlipPageViewer";
import Navbar from "./components/Header";
import AdminPanel from "./pages/AdminPanel";
import ImageSliderAdmin from './components/ImageSliderAdmin';



function Layout({ children }) {
  const location = useLocation();

  // Hide navbar on FlipbookViewer routes
  const hideNavbar =
    location.pathname.startsWith("/book/") ||
    location.pathname.startsWith("/flipbook/view/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}




export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* Flipbook routes (NO NAVBAR) */}
              <Route path="/book/:flipbookId" element={<FlipbookViewer />} />
              <Route path="/flipbook/view/:accessToken" element={<FlipbookViewer />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/slider" element={<ImageSliderAdmin />} />
              <Route path="/admin/image-slider" element={<ImageSliderAdmin />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
