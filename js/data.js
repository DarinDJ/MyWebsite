/* ------------------------------------------------------------------
   EDIT ME — all the content on the site lives here.
------------------------------------------------------------------- */
const DATA = {
  // typed under the hero name
  roles: [
    "student researcher @ KIST",
    "M.S. candidate @ UST–KIST",
    "machine learning & signal analysis",
    "data → insight → decisions",
  ],

  // Revealed as the "denoise" slider moves towards signal.
  facts: [
    "M.S. student at UST, working as a student researcher at KIST — Korea's flagship science institute.",
    "I build ML and signal-processing pipelines, from bank-churn prediction to detecting oscillation bursts in brain recordings.",
    "I care whether a model is explainable and useful, not just accurate.",
    "Comfortable across the stack: Python, SQL, Power BI — and enough web to ship my own tools.",
    "Aiming for industry: applied data and AI roles where technical work drives real business outcomes.",
  ],

  principles: [
    { n: "01", title: "Frame the problem", text: "Start from the decision the data should inform, not the model I happen to want to use." },
    { n: "02", title: "Build, then stress-test", text: "Validate properly, explain the model, and know exactly where it breaks." },
    { n: "03", title: "Make it land", text: "A result nobody understands changes nothing. I turn findings into clear stories and dashboards." },
  ],

  timeline: [
    { when: "2022 – 2026", title: "B.Tech · Christ University, Bengaluru",
      text: "Computer Science & Engineering with Data Science (GPA 3.7/4), plus software internships at Hindustan Aeronautics (HAL) and Microhard Services." },
    { when: "May – Aug 2026", title: "Research Intern · KIST",
      text: "Built Python tools for analysing neural oscillations in brain-recording data at the Korea Institute of Science and Technology." },
    { when: "Sep 2026 →", title: "M.S. AI and Robotics · UST–KIST School",
      text: "Master's in AI and Robotics at the University of Science and Technology, based at KIST in Seoul." },
    { when: "Now", title: "Student Researcher · KIST",
      text: "Building research software and applying AI to mouse neuroscience data at KIST, alongside the master's." },
  ],

  projects: [
    { title: "Bank Customer Churn Prediction", tag: "Machine learning",
      text: "Compared six classifiers on 10,000 bank customers to predict who is likely to leave, and wrapped the best model in a small desktop app for instant predictions.",
      stack: ["Python", "scikit-learn", "Random Forest"],
      link: "https://github.com/DarinDJ/Bank_Customer_Churn" },
    { title: "Facial Recognition & Emotion Detection", tag: "Computer vision",
      text: "Convolutional neural network that recognises faces and reads emotion in real time from a live video feed.",
      stack: ["OpenCV", "TensorFlow", "Keras"],
      link: "" },
    { title: "Keraleeyam Association Website", tag: "Full-stack web",
      text: "Full-stack site for a 50+ member association, with automated database-driven content that cut manual effort by 60%. Built with a team of five.",
      stack: ["React", "TypeScript", "Supabase"],
      link: "https://keraleeyam.vercel.app" },
    { title: "Neural Burst Analysis", tag: "Research · KIST",
      text: "Pipeline that cleans brain-recording signals, detects oscillatory bursts, and compares them statistically across experimental conditions.",
      stack: ["Python", "MNE", "SciPy"],
      link: "" },
  ],

  // group -> skills (drives both the constellation and the list)
  skills: {
    "Languages": ["Python", "Java", "JavaScript", "TypeScript", "SQL"],
    "ML / AI":   ["scikit-learn", "TensorFlow", "Keras", "OpenCV"],
    "Signals":   ["MNE-Python", "SciPy", "statsmodels"],
    "Data":      ["pandas", "Power BI", "MySQL", "Jupyter"],
    "Web":       ["React", "Node.js", "Supabase"],
  },

  links: [
    { label: "LinkedIn",  href: "https://www.linkedin.com/in/darin-davis-johnson/", primary: true },
    { label: "GitHub",    href: "https://github.com/DarinDJ" },
    { label: "Instagram", href: "https://www.instagram.com/darin_john7" },
    { label: "Email",     href: "mailto:darinjohn23@gmail.com" },
  ],

  resume: "assets/Resume.pdf",
};
