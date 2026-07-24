// Import React hooks used for state management and lifecycle handling.
import React, { useEffect, useState } from "react";

// Import the shared top navigation component.
import TopBar from "../components/TopBar";

// Import the page-specific stylesheet.
import "../styles/AboutUsPage.css";

// Import the architectural images displayed in the slider.
import About from "../assets/images/About.png";
import Najd from "../assets/images/Najd.png";
import Madinah from "../assets/images/almadinah.png";
import Abha from "../assets/images/Abha.svg";

// Import decorative elements used around the slider.
import Triangle from "../assets/images/triangle.png";
import Leg from "../assets/images/leg.png";
import Palm from "../assets/images/tree palm.png";

// Import the IRTH logo displayed in the content section.
import GreenLogo from "../assets/images/Irth-BrownLogo.png";

// Store all slider images in a single array.
const images = [About, Najd, Madinah, Abha];

// About Us page component.
const AboutUsPage = () => {
  // Track the index of the currently displayed image.
  const [currentImage, setCurrentImage] = useState(0);

  // Automatically move to the next image every three seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    // Clear the interval when the component is removed.
    return () => clearInterval(interval);
  }, []);

  return (
    // Main page wrapper.
    <div className="about-wrap">
      {/* Display the shared top navigation bar. */}
      <TopBar />

      {/* Main About Us content section. */}
      <section className="about-card">
        {/* Left section containing the image slider and decorations. */}
        <div className="about-left">
          {/* Decorative architectural elements. */}
          <img src={Triangle} alt="" className="about-triangle" />
          <img src={Leg} alt="" className="about-leg" />
          <img src={Palm} alt="" className="about-palm" />

          {/* Display the currently selected architectural image. */}
          <img
            src={images[currentImage]}
            alt="العمارة السعودية"
            className="about-left-img"
          />

          {/* Slider navigation dots. */}
          <div className="about-slider-dots">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`about-dot ${currentImage === index ? "active" : ""}`}
                onClick={() => setCurrentImage(index)}
                aria-label={`عرض الصورة ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right section containing the logo and platform description. */}
        <div className="about-right">
          <div className="about-right-inner">
            {/* IRTH brand logo. */}
            <img
              src={GreenLogo}
              alt="شعار إرث"
              className="about-title-logo"
            />

            {/* Decorative divider below the logo. */}
            <div className="about-divider" />

            {/* Brief description of the IRTH platform. */}
            <p className="about-text">
              إرث منصة ذكية تهدف إلى حماية الهوية العمرانية السعودية، وتعزيز
              الالتزام بالطابع المعماري المعتمد لكل منطقة باستخدام تقنيات
              الذكاء الاصطناعي. تتيح المنصة للزائر اختيار الطراز المعماري،
              ورفع التصميم، ثم الاطلاع مباشرة على نتيجة التحليل والتوصيات.
            </p>

            {/* Platform focus areas. */}
            <div className="about-badge-row">
              <div className="about-badge">التراث العمراني</div>
              <div className="about-badge">الذكاء الاصطناعي</div>
              <div className="about-badge">الهوية السعودية</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Export the component for use in the application.
export default AboutUsPage;