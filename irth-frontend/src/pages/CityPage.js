// Import React hooks for memoized values and component state.
import { useMemo, useState } from "react";

// Import the navigation hook for moving between application routes.
import { useNavigate } from "react-router-dom";

// Import the shared top navigation component.
import TopBar from "../components/TopBar";

// Import the page-specific stylesheet.
import "../styles/cityPage.css";

// Import decorative assets used inside the city selection panel.
import triangle from "../assets/images/triangle.png";
import palm from "../assets/images/tree palm.png";
import leg from "../assets/images/leg.png";

// Render the first step of the design analysis workflow.
export default function CityPage2() {
  // Initialize route navigation.
  const navigate = useNavigate();

  // Store the city or architectural style selected by the user.
  const [city, setCity] = useState("");

  // Track the select field focus state for visual styling.
  const [focused, setFocused] = useState(false);

  // Calculate the current progress-step status whenever the city changes.
  const stepStatus = useMemo(
    () => ({
      current: 1,
      step1Done: Boolean(city),
      step2Done: false,
    }),
    [city]
  );

  // Save the selection and continue to the upload page.
  const onNext = () => {
    localStorage.setItem("selectedCity", city);
    navigate("/upload", { state: { city } });
  };

  return (
    <>
      {/* Display the shared application header. */}
      <TopBar />

      {/* Main city selection page. */}
      <div className="pPage">
        {/* Display the workflow progress indicator. */}
        <div className="pTop">
          <Stepper status={stepStatus} />
        </div>

        <div className="pContainer">
          {/* City selection panel. */}
          <section className="pPanel">
            {/* Background gradient decorations. */}
            <div className="pBlob pBlob--tl" aria-hidden="true" />
            <div className="pBlob pBlob--br" aria-hidden="true" />

            {/* Architectural decorative images. */}
            <img className="pDecor pTriangle" src={triangle} alt="" />
            <img className="pDecor pPalm" src={palm} alt="" />
            <img className="pDecor pLeg" src={leg} alt="" />

            {/* Main interactive content. */}
            <div className="pContent">
              {/* Page heading and supporting instructions. */}
              <div className="pTitleGroup">
                <span className="pEyebrow">الخطوة الأولى</span>

                <h1 className="pTitle">اختــر المديـــنة</h1>

                <p className="pSubtitle">
                  حدّد المنطقة الجغرافية للحصول على أفضل النتائج
                </p>
              </div>

              {/* City selection field with focus-based styling. */}
              <div className={`pField ${focused ? "pField--focused" : ""}`}>
                <label className="pLabel" htmlFor="city-select">
                  المدينة
                </label>

                <div className="pSelectWrapper">
                  <select
                    id="city-select"
                    className="pSelect"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-label="اخـــتر المديــــنة"
                  >
                    <option value="" disabled>
                      اختـر مديـنة
                    </option>

                    <option value="النجدية">النجدية</option>
                    <option value="الحجازية الساحلية">الحجازية</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="مرتفعات ابها">ابها</option>
                  </select>

                  <span className="pSelectArrow" aria-hidden="true">
                    ▾
                  </span>
                </div>
              </div>

              {/* Show the selected city only after the user makes a choice. */}
              {city && (
                <div className="pSelectedBadge">
                  <span className="pBadgeDot" />
                  {city}
                </div>
              )}

              {/* Continue button remains disabled until a city is selected. */}
              <button
                className="pNextBtn"
                type="button"
                disabled={!city}
                onClick={onNext}
              >
                <span>التالي</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// Render the complete three-step workflow indicator.
function Stepper({ status }) {
  const { current, step1Done, step2Done } = status;

  return (
    <div className="sStepper" dir="rtl">
      <Step
        number={1}
        label="المرحلة 1"
        active={current === 1}
        done={step1Done}
      />

      <Track done={step1Done} />

      <Step
        number={2}
        label="المرحلة 2"
        active={current === 2}
        done={step2Done}
      />

      <Track done={step2Done} />

      <Step
        number={3}
        label="النتائج"
        active={current === 3}
        done={false}
      />
    </div>
  );
}

// Render an individual workflow step and its current state.
function Step({ number, label, active, done }) {
  return (
    <div className="sStep">
      <div
        className={`sCircle ${active ? "isActive" : ""} ${
          done ? "isDone" : ""
        }`}
      >
        {done ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span className="sCircleNum">{number}</span>
        )}
      </div>

      <div className={`sLabel ${active ? "isActiveLabel" : ""}`}>
        {label}
      </div>
    </div>
  );
}

// Render the connector between two workflow steps.
function Track({ done }) {
  return (
    <div className="sTrack" aria-hidden="true">
      <div className={`sTrackFill ${done ? "isFilled" : ""}`} />
    </div>
  );
}