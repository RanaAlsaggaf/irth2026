// Import React Router components used for application navigation.
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// Import the main application pages.
import AboutUsPage from "./pages/AboutUsPage";
import CityPage from "./pages/CityPage";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

// Import the shared website footer.
import Footer from "./components/Footer";

// Import the global application stylesheet.
import "./styles.css";

// Render the main application and define its routes.
function App() {
  return (
    // Enable browser-based routing throughout the application.
    <Router>
      {/* Define all available application routes. */}
      <Routes>
        {/* Display the About Us page. */}
        <Route path="/about" element={<AboutUsPage />} />

        {/* Display the city selection page. */}
        <Route path="/city" element={<CityPage />} />

        {/* Display the design upload page. */}
        <Route path="/upload" element={<UploadPage />} />

        {/* Display the architectural analysis results page. */}
        <Route path="/results" element={<ResultsPage />} />

        {/* Redirect the root route to the city selection page. */}
        <Route path="/" element={<Navigate to="/city" replace />} />

        {/* Redirect unknown routes to the city selection page. */}
        <Route path="*" element={<Navigate to="/city" replace />} />
      </Routes>

      {/* Display the shared footer below all application pages. */}
      <Footer />
    </Router>
  );
}

// Export the main application component.
export default App;