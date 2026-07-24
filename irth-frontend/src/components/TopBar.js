// Import NavLink to create navigation links with active-route styling.
import { NavLink } from "react-router-dom";

// Import the component-specific stylesheet.
import "./TopBar.css";

// Import the IRTH logo image.
import logo from "../assets/images/logo.png";

// Render the shared top navigation bar.
export default function TopBar() {
  return (
    // Use a right-to-left layout for the Arabic interface.
    <header className="topbar" dir="rtl">
      {/* Center and arrange all navigation elements. */}
      <div className="topbar__inner">
        {/* Logo link that starts the design analysis workflow. */}
        <NavLink
          to="/city"
          className="topbar__logoWrap"
          aria-label="ابدأ تحليل التصميم"
        >
          <img className="topbar__logo" src={logo} alt="إرث" />
        </NavLink>

        {/* Main navigation links. */}
        <nav className="topbar__nav" aria-label="التنقل الرئيسي">
          {/* Navigate to the About Us page. */}
          <NavLink to="/about" className="topbar__link">
            من نحن
          </NavLink>

          {/* Navigate to the city selection and analysis workflow. */}
          <NavLink to="/city" className="topbar__link">
            تحليل التصميم
          </NavLink>
        </nav>

        {/* Primary call-to-action link. */}
        <NavLink to="/city" className="topbar__start">
          ابدأ الآن
        </NavLink>
      </div>
    </header>
  );
}