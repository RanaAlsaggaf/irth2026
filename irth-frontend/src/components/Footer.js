// Import the footer-specific stylesheet.
import "./Footer.css";

// Render the shared website footer.
export default function Footer() {
  return (
    // Use a right-to-left layout for the Arabic copyright text.
    <footer className="footer" dir="rtl">
      <p>
        {/* Display the current year automatically. */}
        © {new Date().getFullYear()} إرث. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}