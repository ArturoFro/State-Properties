import React, { useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  CircleHelp, FileText, FlaskConical, GraduationCap, Lightbulb, LockKeyhole,
  Plus, RefreshCw, Sparkles, Target, Upload
} from "lucide-react";

const initialTopics = [
  { id: 1, name: "First-order differential equations", unit: "Differential Equations", progress: 62, status: "In progress", tag: "Core concept" },
  { id: 2, name: "Separable equations", unit: "Differential Equations", progress: 25, status: "In progress", tag: "Practice" },
  { id: 3, name: "Laplace transforms", unit: "Differential Equations", progress: 0, status: "Not started", tag: "Coming up" },
  { id: 4, name: "Linear systems", unit: "Linear Algebra", progress: 0, status: "Not started", tag: "Coming up" },
];

const DISCIPLINES = [
  "Chemical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Biomedical Engineering",
  "Aerospace Engineering",
];

const LEARNING_STYLES = [
  {
    id: "Visual & Intuitive",
    label: "Visual & Intuitive",
    short: "Visual",
    hint: "Emphasizes curves, decay plots, and physical intuition before algebra.",
  },
  {
    id: "Analytical & Step-by-Step",
    label: "Analytical & Step-by-Step",
    short: "Analytical",
    hint: "Focuses on formal derivations, separation of variables, and exact symbolic steps.",
  },
  {
    id: "Application & Physical",
    label: "Application & Physical",
    short: "Application",
    hint: "Connects equations directly to reactors, circuits, structures, and control systems.",
  },
  {
    id: "Worked Examples",
    label: "Worked Examples",
    short: "Worked Math",
    hint: "Prioritizes concrete numerical calculations, unit checks, and problem-solving practice.",
  },
];

// Question bank across majors and learning styles (mix of math and text questions).
// Each major has its own questions; when a major is selected, only that major's questions are visible.
const SAMPLE_QUESTIONS = [
  {
    id: "chem-visual",
    major: "Chemical Engineering",
    styles: ["Visual & Intuitive"],
    topicId: 1,
    kind: "text",
    typeLabel: "CHEMICAL ENG · VISUAL & INTUITIVE · TEXT",
    title: "Reading concentration decay on a reactor curve",
    prompt: (
      <>
        In a batch reactor with <b>dCₐ/dt = −kCₐ</b>, how does the slope of the{" "}
        <b>Cₐ vs. time</b> curve change as time increases?
      </>
    ),
    options: [
      { id: "a", text: "It starts steep (fast drop) and flattens toward zero as Cₐ decreases." },
      { id: "b", text: "It starts flat and becomes steeper as time goes on." },
      { id: "c", text: "It stays a straight line with constant negative slope." },
      { id: "d", text: "It turns upward once half of the reactant is consumed." },
    ],
    correctOption: "a",
    successTitle: "Great curve intuition.",
    successBody:
      "Because consumption rate is −kCₐ, a smaller Cₐ later in time means a gentler downward slope.",
    hint1: "Slope of Cₐ(t) equals dCₐ/dt = −kCₐ. What happens to |−kCₐ| as Cₐ drops?",
    hint2: "Lower concentration means slower consumption, so the curve levels out.",
    adaptBody:
      "At t = 0 concentration is highest, so the drop is steepest; as Cₐ shrinks, the slope gets shallower.",
    openVisualOnAdapt: true,
  },
  {
    id: "chem-math",
    major: "Chemical Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step", "Application & Physical"],
    topicId: 1,
    kind: "math",
    typeLabel: "CHEMICAL ENG · MATH PROBLEM",
    title: "Batch reactor remaining fraction",
    prompt: (
      <>
        A batch reactor follows first-order kinetics. If <b>k = 0.2 min⁻¹</b>, what fraction of the
        initial reactant concentration remains after <b>5 minutes</b>?
      </>
    ),
    inputLabel: "Remaining fraction (decimal)",
    placeholder: "e.g. 0.37",
    target: 0.368,
    tolerance: 0.015,
    successTitle: "That's it.",
    successBody:
      "Cₐ/Cₐ₀ = e^(−0.2 × 5) = e⁻¹ ≈ 0.368 (about 36.8% remaining).",
    hint1: "Compute the exponent −k·t = −(0.2 × 5) = −1, then evaluate e⁻¹.",
    hint2: "e⁻¹ is approximately 0.368.",
    adaptBody:
      "After one time constant (kt = 1), e⁻¹ ≈ 0.368 of the initial reactant remains.",
    openVisualOnAdapt: true,
  },
  {
    id: "mech-math-worked",
    major: "Mechanical Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step", "Application & Physical"],
    topicId: 1,
    kind: "math",
    typeLabel: "MECHANICAL ENG · MATH PROBLEM",
    title: "Undamped natural frequency of a mass-spring system",
    prompt: (
      <>
        For a mechanical oscillator with spring stiffness <b>k = 400 N/m</b> and mass{" "}
        <b>m = 4 kg</b>, calculate the natural frequency <b>ωₙ = √(k / m)</b> in <b>rad/s</b>.
      </>
    ),
    inputLabel: "Natural frequency ωₙ (rad/s)",
    placeholder: "e.g. 10",
    target: 10,
    tolerance: 0.05,
    successTitle: "Clean mechanical math.",
    successBody:
      "ωₙ = √(400 / 4) = √100 = 10 rad/s.",
    hint1: "Divide stiffness k (400) by mass m (4) first, then take the square root.",
    hint2: "400 / 4 = 100, and √100 = 10.",
    adaptBody:
      "Plug k = 400 and m = 4 into ωₙ = √(k/m) -> √(400/4) = √100 = 10 rad/s.",
    openVisualOnAdapt: false,
  },
  {
    id: "mech-visual",
    major: "Mechanical Engineering",
    styles: ["Visual & Intuitive"],
    topicId: 1,
    kind: "text",
    typeLabel: "MECHANICAL ENG · VISUAL & INTUITIVE · TEXT",
    title: "Effect of damping on oscillation amplitude",
    prompt: (
      <>
        In a damped mechanical vibration plot, what visual feature distinguishes an{" "}
        <b>underdamped</b> response from an <b>overdamped</b> response?
      </>
    ),
    options: [
      { id: "a", text: "Decaying oscillations (waves) crossing equilibrium before settling." },
      { id: "b", text: "Infinite oscillations that grow larger with every cycle." },
      { id: "c", text: "A sharp 90-degree corner with zero derivative." },
      { id: "d", text: "A vertical jump that never changes afterward." },
    ],
    correctOption: "a",
    successTitle: "Spot on.",
    successBody:
      "Underdamped systems oscillate with a decaying envelope, whereas overdamped systems return smoothly without crossing equilibrium repeatedly.",
    hint1: "Think about a car suspension bouncing once or twice vs. returning slowly without bounce.",
    hint2: "Underdamped motion rings/oscillates with decreasing peak amplitude.",
    adaptBody:
      "Underdamped = damped sine waves; overdamped = non-oscillatory smooth return.",
    openVisualOnAdapt: false,
  },
  {
    id: "civil-text",
    major: "Civil Engineering",
    styles: ["Visual & Intuitive", "Application & Physical"],
    topicId: 2,
    kind: "text",
    typeLabel: "CIVIL ENG · TEXT",
    title: "Bending moment in a simply supported beam",
    prompt: (
      <>
        A uniform, simply supported horizontal beam carries a single downward point load right at
        its <b>midpoint</b>. Where does the maximum bending moment occur along the beam?
      </>
    ),
    options: [
      { id: "a", text: "At the midpoint directly under the concentrated load." },
      { id: "b", text: "At the left support pin where vertical reaction is zero." },
      { id: "c", text: "At the right roller support where deflection is maximum." },
      { id: "d", text: "Uniformly constant across the entire span from end to end." },
    ],
    correctOption: "a",
    successTitle: "Right on structural intuition.",
    successBody:
      "For a symmetric simply supported beam with a center point load P and span L, the bending moment peaks at midspan (PL/4).",
    hint1: "Moment is zero at pinned/roller supports and peaks where shear crosses zero.",
    hint2: "By symmetry, the peak moment is at the center of the beam.",
    adaptBody:
      "Maximum bending moment for a centered point load on a simply supported beam occurs right at midspan.",
    openVisualOnAdapt: false,
  },
  {
    id: "civil-math",
    major: "Civil Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step"],
    topicId: 2,
    kind: "math",
    typeLabel: "CIVIL ENG · MATH PROBLEM",
    title: "Axial normal stress in a steel tie rod",
    prompt: (
      <>
        A steel structural rod carries an axial tensile load <b>F = 120 kN</b> over a
        cross-sectional area <b>A = 0.006 m²</b>. Calculate normal stress{" "}
        <b>σ = F / A</b> in <b>kPa</b>.
      </>
    ),
    inputLabel: "Normal stress σ (kPa)",
    placeholder: "e.g. 20000",
    target: 20000,
    tolerance: 50,
    successTitle: "Solid structural calculation.",
    successBody:
      "σ = 120 kN / 0.006 m² = 20,000 kPa (20 MPa).",
    hint1: "Divide F = 120 by A = 0.006.",
    hint2: "120 / 0.006 = 120,000 / 6 = 20,000 kPa.",
    adaptBody:
      "Stress is force divided by area: 120 / 0.006 = 20,000 kPa.",
    openVisualOnAdapt: false,
  },
  {
    id: "elec-math",
    major: "Electrical Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step", "Application & Physical"],
    topicId: 1,
    kind: "math",
    typeLabel: "ELECTRICAL ENG · MATH PROBLEM",
    title: "RC circuit time constant",
    prompt: (
      <>
        A first-order RC circuit has resistance <b>R = 2,000 Ω</b> and capacitance{" "}
        <b>C = 0.005 F</b>. What is the circuit time constant <b>τ = R · C</b> in <b>seconds</b>?
      </>
    ),
    inputLabel: "Time constant τ (seconds)",
    placeholder: "e.g. 10",
    target: 10,
    tolerance: 0.05,
    successTitle: "Exact circuit timing.",
    successBody:
      "τ = R × C = 2,000 Ω × 0.005 F = 10 s.",
    hint1: "Multiply resistance R (2,000) by capacitance C (0.005).",
    hint2: "2,000 × 0.005 = 10 seconds.",
    adaptBody:
      "Time constant of an RC circuit is τ = RC = 2000 × 0.005 = 10 s.",
    openVisualOnAdapt: true,
  },
  {
    id: "elec-visual",
    major: "Electrical Engineering",
    styles: ["Visual & Intuitive"],
    topicId: 1,
    kind: "text",
    typeLabel: "ELECTRICAL ENG · VISUAL & INTUITIVE · TEXT",
    title: "Capacitor voltage curve during charging",
    prompt: (
      <>
        When a discharged capacitor charges through a resistor from a constant DC source, how does{" "}
        <b>v_C(t)</b> behave?
      </>
    ),
    options: [
      { id: "a", text: "It rises quickly at first and approaches the source voltage asymptotically." },
      { id: "b", text: "It drops toward zero along a negative exponential curve." },
      { id: "c", text: "It jumps instantaneously to infinity at t = 0." },
      { id: "d", text: "It stays at 0 V permanently because capacitors block DC at steady state." },
    ],
    correctOption: "a",
    successTitle: "Good charging intuition.",
    successBody:
      "v_C(t) = V_s(1 − e^(−t/RC)) starts with steep slope V_s/(RC) and levels off at V_s.",
    hint1: "A charging capacitor starts at 0 V and approaches the supply voltage smoothly.",
    hint2: "Rate of voltage rise slows as v_C gets closer to the source voltage.",
    adaptBody:
      "Charging capacitor voltage rises toward V_s with slope slowing as the gap narrows.",
    openVisualOnAdapt: true,
  },
  {
    id: "bio-text",
    major: "Biomedical Engineering",
    styles: ["Visual & Intuitive", "Application & Physical"],
    topicId: 2,
    kind: "text",
    typeLabel: "BIOMEDICAL ENG · TEXT",
    title: "First-order drug elimination in a single compartment",
    prompt: (
      <>
        In a single-compartment pharmacokinetic model, plasma drug concentration follows{" "}
        <b>dC/dt = −kₑC</b>. If clearance increases (higher <b>kₑ</b>), what happens to
        elimination half-life?
      </>
    ),
    options: [
      { id: "a", text: "The elimination half-life decreases (the drug clears faster)." },
      { id: "b", text: "The elimination half-life increases (the drug stays longer)." },
      { id: "c", text: "The elimination half-life stays unchanged regardless of kₑ." },
      { id: "d", text: "The drug concentration stops decaying and becomes constant." },
    ],
    correctOption: "a",
    successTitle: "Clear physiological connection.",
    successBody:
      "t₁/₂ = ln(2)/kₑ. A larger elimination rate constant kₑ shortens the time to reach half concentration.",
    hint1: "kₑ is in the denominator of t₁/₂ = ln(2)/kₑ.",
    hint2: "Faster clearance means less time needed to drop to 50%.",
    adaptBody:
      "Higher kₑ = faster clearance = shorter half-life.",
    openVisualOnAdapt: false,
  },
  {
    id: "bio-math",
    major: "Biomedical Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step"],
    topicId: 2,
    kind: "math",
    typeLabel: "BIOMEDICAL ENG · MATH PROBLEM",
    title: "Initial infusion/bolus concentration from dose and volume",
    prompt: (
      <>
        A drug bolus of <b>D = 120 mg</b> distributes into an apparent volume of distribution{" "}
        <b>V_d = 6 L</b>. Calculate initial concentration <b>C₀ = D / V_d</b> in <b>mg/L</b>.
      </>
    ),
    inputLabel: "Initial concentration C₀ (mg/L)",
    placeholder: "e.g. 20",
    target: 20,
    tolerance: 0.05,
    successTitle: "Accurate compartment math.",
    successBody:
      "C₀ = 120 mg / 6 L = 20 mg/L.",
    hint1: "Divide dose D (120 mg) by volume V_d (6 L).",
    hint2: "120 / 6 = 20 mg/L.",
    adaptBody:
      "C₀ = D / V_d = 120 / 6 = 20 mg/L.",
    openVisualOnAdapt: false,
  },
  {
    id: "aero-math",
    major: "Aerospace Engineering",
    styles: ["Worked Examples", "Analytical & Step-by-Step", "Application & Physical"],
    topicId: 4,
    kind: "math",
    typeLabel: "AEROSPACE ENG · MATH PROBLEM",
    title: "Constant-acceleration velocity gain",
    prompt: (
      <>
        During a climb test, an aircraft experiences a constant forward acceleration of{" "}
        <b>a = 15 m/s²</b> for <b>t = 4 s</b>. Calculate the speed gain <b>Δv = a · t</b> in{" "}
        <b>m/s</b>.
      </>
    ),
    inputLabel: "Speed change Δv (m/s)",
    placeholder: "e.g. 60",
    target: 60,
    tolerance: 0.05,
    successTitle: "Smooth flight-test math.",
    successBody:
      "Δv = a · t = 15 m/s² × 4 s = 60 m/s.",
    hint1: "Multiply acceleration a (15) by time t (4).",
    hint2: "15 × 4 = 60 m/s.",
    adaptBody:
      "Constant acceleration integrated over 4 s gives Δv = 15 × 4 = 60 m/s.",
    openVisualOnAdapt: false,
  },
  {
    id: "aero-visual",
    major: "Aerospace Engineering",
    styles: ["Visual & Intuitive"],
    topicId: 4,
    kind: "text",
    typeLabel: "AEROSPACE ENG · VISUAL & INTUITIVE · TEXT",
    title: "Velocity vs. time under constant acceleration",
    prompt: (
      <>
        On a <b>velocity vs. time</b> graph, what does a constant positive acceleration look like?
      </>
    ),
    options: [
      { id: "a", text: "A straight line sloping upward with slope equal to acceleration." },
      { id: "b", text: "A horizontal flat line with zero slope." },
      { id: "c", text: "A downward curve approaching zero." },
      { id: "d", text: "A vertical line at t = 0." },
    ],
    correctOption: "a",
    successTitle: "Clean kinematic graph reading.",
    successBody:
      "Since v(t) = v₀ + at, plotting v against t yields a straight line with slope a.",
    hint1: "Acceleration is the slope dv/dt on a velocity-time graph.",
    hint2: "A constant non-zero slope means a straight angled line.",
    adaptBody:
      "On v vs. t, constant acceleration is a straight line with slope = a.",
    openVisualOnAdapt: false,
  },
];

function getQuestionsForMajor(major) {
  return SAMPLE_QUESTIONS.filter(q => q.major === major);
}

function findQuestionIdForMajorAndStyle(major, style, preferMath = false) {
  const majorQs = getQuestionsForMajor(major);
  if (!majorQs.length) return SAMPLE_QUESTIONS[0].id;

  if (preferMath) {
    const mathQ = majorQs.find(q => q.kind === "math");
    if (mathQ) return mathQ.id;
  }

  const exactQ = majorQs.find(q => q.styles.includes(style));
  if (exactQ) return exactQ.id;

  return majorQs[0].id;
}

function DecayGraph() {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = 52 + i * 8.3;
    const y = 22 + 142 * (1 - Math.exp(-i / 11));
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 410 205" className="graph" role="img" aria-label="Exponential decay graph">
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1="52" x2="385" y1={22 + i * 47} y2={22 + i * 47} className="gridline" />
      ))}
      <line x1="52" y1="22" x2="52" y2="164" className="axis" />
      <line x1="52" y1="164" x2="385" y2="164" className="axis" />
      <polyline points={pts} fill="none" stroke="#64d8cb" strokeWidth="3.5" strokeLinecap="round" />
      <text x="8" y="27" className="graph-label">Cₐ</text>
      <text x="376" y="187" className="graph-label">time</text>
      <text x="42" y="181" className="graph-tick">0</text>
      <text x="205" y="181" className="graph-tick">t</text>
      <text x="10" y="72" className="graph-tick">High</text>
      <text x="17" y="162" className="graph-tick">0</text>
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Learn");
  const [topics, setTopics] = useState(initialTopics);
  const [discipline, setDiscipline] = useState("Chemical Engineering");
  const [learningStyle, setLearningStyle] = useState("Visual & Intuitive");
  const [resourceName, setResourceName] = useState("Differential Equations syllabus.pdf");
  const [uploaded, setUploaded] = useState(false);
  const [lessonStage, setLessonStage] = useState("connect");
  const [selectedQuestionId, setSelectedQuestionId] = useState(() =>
    findQuestionIdForMajorAndStyle("Chemical Engineering", "Visual & Intuitive", false)
  );
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [mastered, setMastered] = useState(false);
  const [completedQuestionIds, setCompletedQuestionIds] = useState([]);
  const fileRef = useRef(null);

  // Only show questions belonging to the currently selected major
  const majorQuestions = useMemo(() => getQuestionsForMajor(discipline), [discipline]);

  const currentQuestion = useMemo(() => {
    const foundInMajor = majorQuestions.find(q => q.id === selectedQuestionId);
    if (foundInMajor) return foundInMajor;
    return majorQuestions[0] || SAMPLE_QUESTIONS[0];
  }, [majorQuestions, selectedQuestionId]);

  const currentStyleMeta =
    LEARNING_STYLES.find(s => s.label === learningStyle) || LEARNING_STYLES[0];

  const isNumericCorrect = useMemo(() => {
    if (currentQuestion.kind !== "math") return false;
    const n = Number(answer);
    return (
      answer.trim() !== "" &&
      !Number.isNaN(n) &&
      Math.abs(n - currentQuestion.target) <= currentQuestion.tolerance
    );
  }, [answer, currentQuestion]);

  function clearQuestionAttemptState() {
    setAnswer("");
    setSelectedOption("");
    setAttempts(0);
    setFeedback(null);
    setMastered(false);
  }

  function applyMajorAndStyle(nextMajor, nextStyle, preferMath = false) {
    setDiscipline(nextMajor);
    setLearningStyle(nextStyle);
    const nextQId = findQuestionIdForMajorAndStyle(nextMajor, nextStyle, preferMath);
    setSelectedQuestionId(nextQId);
    clearQuestionAttemptState();
  }

  function handleUpload(file) {
    if (!file) return;
    setResourceName(file.name);
    setUploaded(true);
  }

  function checkAnswer() {
    const isCorrect =
      currentQuestion.kind === "math"
        ? (answer.trim() !== "" && isNumericCorrect)
        : selectedOption === currentQuestion.correctOption;

    if (currentQuestion.kind === "math" && !answer.trim()) return;
    if (currentQuestion.kind === "text" && !selectedOption) return;

    if (isCorrect) {
      setFeedback({
        type: "success",
        title: currentQuestion.successTitle,
        body: currentQuestion.successBody,
      });
      setMastered(true);
      setCompletedQuestionIds(prev =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
      setTopics(old =>
        old.map(t => {
          if (t.id !== currentQuestion.topicId) return t;
          const nextProgress = Math.min(100, t.progress + 18);
          return {
            ...t,
            progress: nextProgress,
            status: nextProgress >= 100 ? "Mastered" : "Improving",
          };
        })
      );
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setFeedback({
          type: "adapt",
          title: "Let's change the approach.",
          body: currentQuestion.adaptBody,
        });
        if (currentQuestion.openVisualOnAdapt) {
          setLessonStage("visual");
        }
      } else {
        setFeedback({
          type: "error",
          title: "Not quite — try again.",
          body: next === 1 ? currentQuestion.hint1 : currentQuestion.hint2,
        });
      }
    }
  }

  function selectMajorQuestion(questionId) {
    if (!majorQuestions.some(q => q.id === questionId)) return;
    setSelectedQuestionId(questionId);
    clearQuestionAttemptState();
    setLessonStage("practice");
  }

  function resetQuestion() {
    clearQuestionAttemptState();
    setLessonStage("connect");
  }

  const nav = ["Overview", "Learn", "My courses", "Review"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">∫</div>
          <span>integral</span>
        </div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav>
          {nav.map(item => (
            <button
              key={item}
              className={`nav-item ${activeTab === item ? "active" : ""}`}
              onClick={() => setActiveTab(item)}
            >
              {item === "Overview" ? (
                <Activity size={17} />
              ) : item === "Learn" ? (
                <BookOpen size={17} />
              ) : item === "My courses" ? (
                <GraduationCap size={17} />
              ) : (
                <RefreshCw size={17} />
              )}
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="course-mini">
            <div className="mini-icon">
              <FlaskConical size={16} />
            </div>
            <div>
              <b>{discipline}</b>
              <small>{currentStyleMeta.short} · {majorQuestions.length} major Qs</small>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">DA</div>
            <div>
              <b>Student workspace</b>
              <small>Engineering student</small>
            </div>
            <ChevronRight size={16} />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <span>{activeTab}</span>
          </div>
          <div className="top-actions">
            <span className="mode-pill">
              <span className="pulse" /> DEMO MODE · NO API
            </span>
            <button className="icon-btn" title="Help">
              <CircleHelp size={18} />
            </button>
          </div>
        </header>

        {activeTab === "Learn" ? (
          <div className="content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  YOUR LEARNING PATH <span className="eyebrow-line" />
                </div>
                <h1>
                  Learn the math.
                  <br />
                  <em>See where it works.</em>
                </h1>
                <p className="subhead">
                  Major: <b>{discipline}</b> · Learning style: <b>{learningStyle}</b>. Only{" "}
                  <b>{discipline}</b> questions are shown for your selected major.
                </p>
              </div>
              <div className="mascot-card">
                <div className="mascot">
                  ∫<span>✦</span>
                </div>
                <div>
                  <b>Professor Integral</b>
                  <small>{currentStyleMeta.short} mode</small>
                </div>
                <span className="online-dot" />
              </div>
            </div>

            <section className="course-banner">
              <div className="course-symbol">
                <FlaskConical size={22} />
              </div>
              <div className="course-info">
                <div className="banner-kicker">
                  {discipline.toUpperCase()} · {learningStyle.toUpperCase()}
                </div>
                <h2>Mathematics for {discipline}</h2>
                <p>
                  Active question: {currentQuestion.title} (
                  {currentQuestion.kind === "math" ? "Practice Math Problem" : "Conceptual Text Question"})
                </p>
              </div>
              <div className="banner-stat">
                <strong>
                  {completedQuestionIds.length}
                  <span> / {SAMPLE_QUESTIONS.length}</span>
                </strong>
                <small>Solved in demo</small>
              </div>
              <button className="outline-btn" onClick={() => setActiveTab("My courses")}>
                Major &amp; style <ArrowRight size={15} />
              </button>
            </section>

            <div className="section-row">
              <div>
                <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
                <h2 className="section-title">Today's lesson</h2>
              </div>
              <span className="time-label">
                12–15 MIN <span>·</span> {discipline.toUpperCase()}
              </span>
            </div>

            <div className="lesson-layout">
              <section className="lesson-card">
                <div className="lesson-topline">
                  <span className="lesson-type">
                    <span className="type-dot" /> {discipline.toUpperCase()}
                  </span>
                  <span className="lesson-number">{learningStyle.toUpperCase()}</span>
                </div>
                <h2>First-order differential equations</h2>
                <p className="lesson-intro">
                  A changing quantity can often be described by how fast it changes. Switch major or
                  learning style to load a tailored question for that major.
                </p>
                <div className="concept-strip">
                  <div className="concept-icon">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <b>Learning style: {learningStyle}</b>
                    <p>{currentStyleMeta.hint}</p>
                  </div>
                </div>
                <div className="equation-box">
                  <span className="equation-label">GOVERNING EQUATION</span>
                  <div className="equation">dCₐ/dt = −kCₐ</div>
                  <div className="equation-explain">
                    <span>
                      <b>Cₐ</b> = state / concentration
                    </span>
                    <span>
                      <b>k</b> = rate / decay parameter
                    </span>
                  </div>
                </div>
                <div className="stage-tabs">
                  <button
                    className={lessonStage === "connect" ? "selected" : ""}
                    onClick={() => setLessonStage("connect")}
                  >
                    <span>01</span> Engineering connection
                  </button>
                  <button
                    className={lessonStage === "visual" ? "selected" : ""}
                    onClick={() => setLessonStage("visual")}
                  >
                    <span>02</span> Visualize it
                  </button>
                  <button
                    className={lessonStage === "practice" ? "selected" : ""}
                    onClick={() => setLessonStage("practice")}
                  >
                    <span>03</span> Practice problem ({majorQuestions.length})
                  </button>
                </div>

                {lessonStage === "connect" && (
                  <div className="application-panel">
                    <div className="app-panel-head">
                      <div className="app-icon">
                        <FlaskConical size={18} />
                      </div>
                      <div>
                        <span className="panel-kicker">{discipline.toUpperCase()}</span>
                        <h3>System behavior &amp; rate of change</h3>
                      </div>
                    </div>
                    <p>
                      Rates of change govern how physical quantities evolve over time. Jump straight
                      into the practice problem for <b>{discipline}</b> ({learningStyle}).
                    </p>
                    <div className="process-flow">
                      <div className="process-node">
                        <span>MAJOR</span>
                        <b>{discipline.replace(" Engineering", "")}</b>
                        <small>Selected track</small>
                      </div>
                      <ArrowRight size={17} />
                      <div className="process-node">
                        <span>STYLE</span>
                        <b>{currentStyleMeta.short}</b>
                        <small>Selected mode</small>
                      </div>
                      <ArrowRight size={17} />
                      <div className="process-node">
                        <span>QUESTION</span>
                        <b>{currentQuestion.kind === "math" ? "Math Problem" : "Text Question"}</b>
                        <small>{currentQuestion.title}</small>
                      </div>
                    </div>
                    <button className="primary-btn" onClick={() => setLessonStage("practice")}>
                      Open practice problem <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {lessonStage === "visual" && (
                  <div className="application-panel">
                    <div className="app-panel-head">
                      <div className="app-icon">
                        <Activity size={18} />
                      </div>
                      <div>
                        <span className="panel-kicker">VISUAL EXPLANATION</span>
                        <h3>Watch exponential decay</h3>
                      </div>
                    </div>
                    <p>
                      Exponential decay curves show rapid early change that tapers off over time.
                    </p>
                    <DecayGraph />
                    <div className="insight-note">
                      <Sparkles size={16} />
                      <span>
                        <b>Engineering insight:</b> Parameters in the model control how quickly the
                        system responds.
                      </span>
                    </div>
                    <button className="primary-btn" onClick={() => setLessonStage("practice")}>
                      Go to practice problem <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {lessonStage === "practice" && (
                  <div className="application-panel practice-panel">
                    <div className="app-panel-head">
                      <div className="app-icon">
                        <Target size={18} />
                      </div>
                      <div>
                        <span className="panel-kicker">{currentQuestion.typeLabel}</span>
                        <h3>{currentQuestion.title}</h3>
                      </div>
                    </div>

                    <div className="quick-context-bar">
                      <label className="mini-select-group">
                        <span>Major</span>
                        <select
                          value={discipline}
                          onChange={e => applyMajorAndStyle(e.target.value, learningStyle, false)}
                        >
                          {DISCIPLINES.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </label>
                      <label className="mini-select-group">
                        <span>Learning style</span>
                        <select
                          value={learningStyle}
                          onChange={e => applyMajorAndStyle(discipline, e.target.value, false)}
                        >
                          {LEARNING_STYLES.map(s => (
                            <option key={s.id} value={s.label}>{s.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="sample-switcher" role="group" aria-label="Major questions">
                      {majorQuestions.map((q, idx) => {
                        const done = completedQuestionIds.includes(q.id);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            className={`sample-pill ${currentQuestion.id === q.id ? "active" : ""} ${done ? "done" : ""}`}
                            onClick={() => selectMajorQuestion(q.id)}
                          >
                            <span>Q{idx + 1}</span>
                            <small>{q.kind === "math" ? "Math" : "Text"}</small>
                            {done && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>

                    <p>{currentQuestion.prompt}</p>

                    {currentQuestion.kind === "math" ? (
                      <div className="answer-row">
                        <label htmlFor="answer">{currentQuestion.inputLabel}</label>
                        <div className="answer-input-wrap">
                          <input
                            id="answer"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && checkAnswer()}
                            placeholder={currentQuestion.placeholder}
                          />
                          <button className="primary-btn check-btn" onClick={checkAnswer}>
                            Check answer <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="choice-list">
                        {currentQuestion.options.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`choice-btn ${selectedOption === opt.id ? "selected" : ""}`}
                            onClick={() => setSelectedOption(opt.id)}
                          >
                            <span className="choice-key">{opt.id.toUpperCase()}</span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                        <div className="answer-input-wrap choice-submit-row">
                          <button className="primary-btn check-btn" onClick={checkAnswer}>
                            Check answer <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}

                    {feedback && (
                      <div className={`feedback ${feedback.type}`}>
                        <div className="feedback-icon">
                          {feedback.type === "success" ? (
                            <CheckCircle2 size={18} />
                          ) : feedback.type === "adapt" ? (
                            <Sparkles size={18} />
                          ) : (
                            <CircleHelp size={18} />
                          )}
                        </div>
                        <div>
                          <b>{feedback.title}</b>
                          <p>{feedback.body}</p>
                          {feedback.type === "adapt" && currentQuestion.openVisualOnAdapt && (
                            <button
                              className="text-btn"
                              onClick={() => setLessonStage("visual")}
                            >
                              Open visual explanation <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {mastered && (
                      <div className="mastery-line">
                        <CheckCircle2 size={16} /> Progress bar updated — topic mastery increased.
                      </div>
                    )}

                    <div className="practice-actions-bar">
                      <button className="reset-link" onClick={resetQuestion}>
                        Reset practice <RefreshCw size={13} />
                      </button>
                      {majorQuestions.length > 1 && (
                        <button
                          type="button"
                          className="text-btn next-sample-btn"
                          onClick={() => {
                            const curIdx = majorQuestions.findIndex(q => q.id === currentQuestion.id);
                            const nextQ = majorQuestions[(curIdx + 1) % majorQuestions.length];
                            selectMajorQuestion(nextQ.id);
                          }}
                        >
                          Next {discipline.replace(" Engineering", "")} question <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <aside className="right-rail">
                <section className="resource-card">
                  <div className="rail-heading">
                    <div>
                      <span className="panel-kicker">YOUR MATERIALS</span>
                      <h3>Course resources</h3>
                    </div>
                    <button className="add-btn" onClick={() => fileRef.current?.click()}>
                      <Plus size={17} />
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx"
                    hidden
                    onChange={e => handleUpload(e.target.files?.[0])}
                  />
                  <button className="upload-zone" onClick={() => fileRef.current?.click()}>
                    <Upload size={19} />
                    <span>
                      <b>{uploaded ? "Resource selected" : "Add course material"}</b>
                      <small>
                        {uploaded ? "Ready to use in this demo" : "Syllabus, notes, or study guide"}
                      </small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <div className="resource-file">
                    <div className="file-icon">
                      <FileText size={17} />
                    </div>
                    <div>
                      <b>{resourceName}</b>
                      <small>
                        {uploaded
                          ? "Selected locally · not uploaded to a server"
                          : "Sample resource · demo content"}
                      </small>
                    </div>
                    <Check size={15} className="file-check" />
                  </div>
                  <div className="resource-foot">
                    <LockKeyhole size={12} /> Files stay in this browser demo.
                  </div>
                </section>

                <section className="progress-card">
                  <div className="rail-heading">
                    <div>
                      <span className="panel-kicker">YOUR PROGRESS</span>
                      <h3>Topic mastery</h3>
                    </div>
                    <span className="progress-count">
                      {String(topics.filter(t => t.progress > 0).length).padStart(2, "0")} / 04
                    </span>
                  </div>
                  <div className="topic-list">
                    {topics.map(t => (
                      <div className="topic-row" key={t.id}>
                        <div className="topic-meta">
                          <span>{t.name}</span>
                          <small>{t.progress}%</small>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${t.progress}%` }} />
                        </div>
                        <small className="topic-status">{t.status}</small>
                      </div>
                    ))}
                  </div>
                  <button className="view-all" onClick={() => setActiveTab("Overview")}>
                    View learning overview <ArrowRight size={14} />
                  </button>
                </section>

                <div className="coach-note">
                  <div className="coach-star">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <b>A note from Professor Integral</b>
                    <p>
                      Don't just memorize the equation. Understand what the variables represent in the
                      physical system.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
            <footer className="footer-note">
              INTEGRAL <span>·</span> MATHEMATICS THAT CONNECTS TO ENGINEERING{" "}
              <span className="footer-right">DEMO BUILD · SAMPLE CONTENT · NO API</span>
            </footer>
          </div>
        ) : (
          <div className="content secondary-page">
            <div className="eyebrow">INTEGRAL WORKSPACE</div>
            <h1>
              {activeTab === "Overview"
                ? "Your progress, in context."
                : activeTab === "My courses"
                  ? "Your engineering path."
                  : "Bring it all together."}
            </h1>
            <p className="subhead">
              {activeTab === "Overview"
                ? "A snapshot of the concepts you're building and the applications you're learning to recognize."
                : activeTab === "My courses"
                  ? "Changing your major or learning style updates your active question and hides other majors' questions."
                  : `Showing questions for ${discipline} only.`}
            </p>

            {activeTab === "Overview" && (
              <div className="secondary-grid">
                <div className="metric-card">
                  <span>TOPICS STARTED</span>
                  <strong>
                    {topics.filter(t => t.progress > 0).length} <small>/ 4</small>
                  </strong>
                  <p>Progress bars update as you answer questions.</p>
                </div>
                <div className="metric-card">
                  <span>SAMPLE QUESTIONS SOLVED</span>
                  <strong>
                    {completedQuestionIds.length} <small>/ {SAMPLE_QUESTIONS.length}</small>
                  </strong>
                  <p>Completed across your practice sessions.</p>
                </div>
                <div className="metric-card">
                  <span>ACTIVE MAJOR &amp; STYLE</span>
                  <strong className="metric-style-val">{currentStyleMeta.short}</strong>
                  <p>{discipline} · {currentQuestion.title}.</p>
                </div>
              </div>
            )}

            {activeTab === "My courses" && (
              <div className="wide-card">
                <h2>Engineering major &amp; learning style</h2>
                <p>
                  Select your engineering major and learning style. Only questions for your selected
                  major are shown.
                </p>

                <div className="selector-field">
                  <label htmlFor="major-select">Engineering major (discipline)</label>
                  <select
                    id="major-select"
                    value={discipline}
                    onChange={e => applyMajorAndStyle(e.target.value, learningStyle, false)}
                  >
                    {DISCIPLINES.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-field">
                  <label htmlFor="style-select">Learning style</label>
                  <select
                    id="style-select"
                    value={learningStyle}
                    onChange={e => applyMajorAndStyle(discipline, e.target.value, false)}
                  >
                    {LEARNING_STYLES.map(s => (
                      <option key={s.id} value={s.label}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="style-hint">{currentStyleMeta.hint}</p>
                </div>

                <div className="matched-preview">
                  <span>
                    {discipline.toUpperCase()} QUESTION ({currentQuestion.kind === "math" ? "MATH PROBLEM" : "TEXT QUESTION"})
                  </span>
                  <b>{currentQuestion.title}</b>
                  <p>{currentQuestion.prompt}</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setActiveTab("Learn");
                    setLessonStage("practice");
                  }}
                >
                  Open practice problem <ArrowRight size={16} />
                </button>

                <div className="resource-foot">
                  Local demo selection only — no external API calls are made.
                </div>
              </div>
            )}

            {activeTab === "Review" && (
              <div className="wide-card">
                <div className="review-icon">
                  <Brain size={24} />
                </div>
                <h2>{discipline} questions ({majorQuestions.length})</h2>
                <p>
                  Only questions for <b>{discipline}</b> are displayed while this major is selected.
                </p>
                <div className="review-q-list">
                  {majorQuestions.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      className="review-q-item"
                      onClick={() => {
                        selectMajorQuestion(q.id);
                        setActiveTab("Learn");
                      }}
                    >
                      <span className="review-q-badge">
                        Q{idx + 1} · {q.kind === "math" ? "MATH" : "TEXT"}
                      </span>
                      <b>{q.title}</b>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    const mathId = findQuestionIdForMajorAndStyle(discipline, learningStyle, true);
                    setSelectedQuestionId(mathId);
                    clearQuestionAttemptState();
                    setActiveTab("Learn");
                    setLessonStage("practice");
                  }}
                >
                  Practice {discipline.replace(" Engineering", "")} math problem <ArrowRight size={16} />
                </button>
              </div>
            )}

            <button className="text-btn back-learn" onClick={() => setActiveTab("Learn")}>
              Return to lesson <ArrowRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
