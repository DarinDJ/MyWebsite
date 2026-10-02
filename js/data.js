/* ------------------------------------------------------------------
   EDIT ME — all the content on the site lives here.
   Anything marked TODO is a placeholder for you to fill in.
------------------------------------------------------------------- */
const DATA = {
  // typed under the hero name
  roles: [
    "student researcher @ KIST",
    "M.S. candidate @ UST–KIST",
    "machine learning & computer vision",
    "data → insight → decisions",
  ],

  // Revealed as the "denoise" slider moves towards signal.
  facts: [
    "M.S. student at UST, working as a student researcher at KIST — Korea's flagship science institute.",
    "I build machine-learning and computer-vision models, from customer churn to medical imaging.",
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
    { when: "Earlier", title: "Applied ML projects",
      text: "Churn prediction with XGBoost, real-time emotion detection with CNNs, tumour classification with EfficientNet + Grad-CAM. TODO: add your undergraduate degree here." },
    { when: "Until Aug 2026", title: "Research Intern · KIST",
      text: "Internship at the Korea Institute of Science and Technology." },
    { when: "Sep 2026 →", title: "M.S. AI and Robotics · UST–KIST School",
      text: "Master's at the University of Science and Technology, based at KIST." },
    { when: "Now", title: "Student Researcher · KIST",
      text: "Doing research alongside the master's." },
  ],

  projects: [
    { title: "Bank Customer Churn Prediction", tag: "Machine learning",
      text: "Predictive model that analyses customer behaviour to flag who is likely to leave, so retention efforts can be targeted with data instead of guesswork.",
      stack: ["Python", "scikit-learn", "XGBoost"],
      link: "https://github.com/DarinDJ/Bank_Customer_Churn" },
    { title: "Facial Recognition & Emotion Detection", tag: "Computer vision",
      text: "Convolutional neural network that recognises faces and reads emotion in real time from a live video feed.",
      stack: ["OpenCV", "TensorFlow", "Keras"],
      link: "https://github.com/DarinDJ" },                     // TODO: link the exact repo
    { title: "Brain Tumor Classification + Grad-CAM", tag: "Medical AI",
      text: "EfficientNet classifier paired with Grad-CAM heatmaps, so you can see where the model is looking — not just what it predicts.",
      stack: ["Python", "EfficientNet", "Grad-CAM"],
      link: "https://github.com/DarinDJ" },                     // TODO: link the exact repo
    { title: "Research at KIST", tag: "In progress",
      text: "Current research work at KIST. TODO: add a public-safe description, or keep it short and let people ask.",
      stack: [],
      link: "" },
  ],

  // group -> skills (drives both the constellation and the list)
  skills: {
    "Languages": ["Python", "C", "Java", "JavaScript", "SQL"],
    "ML / AI":   ["TensorFlow", "Keras", "scikit-learn", "XGBoost", "OpenCV"],
    "Data":      ["Power BI", "MySQL", "MongoDB", "Jupyter"],
    "Web":       ["Node.js", "React"],
  },

  links: [
    { label: "LinkedIn",  href: "https://www.linkedin.com/in/darin-davis-johnson/", primary: true },
    { label: "GitHub",    href: "https://github.com/DarinDJ" },
    { label: "Instagram", href: "https://www.instagram.com/darin_john7" },
    // TODO: add { label: "Email", href: "mailto:you@example.com" }
  ],

  resume: "assets/Resume-old.pdf", // TODO: swap in an updated résumé
};
