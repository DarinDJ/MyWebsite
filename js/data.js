/* ------------------------------------------------------------------
   EDIT ME — all the content on the site lives here.
   Lines marked TODO are placeholders for you to fill in.
------------------------------------------------------------------- */
const DATA = {
  roles: [
    "student researcher @ KIST",
    "M.S. student @ UST–KIST",
    "turning noisy data into signal",
    "22 and just getting started",
  ],

  // Revealed one by one as the "denoise" slider moves right.
  facts: [
    "I'm 22, and I'd rather be building than waiting.",
    "M.S. student at UST, based at KIST — since September 2026.",
    "Student researcher at KIST, working where data meets real-world science.",
    "Fluent in Python, C and Java. Dangerous with a Jupyter notebook.",
    "I like finding the pattern hiding inside raw, messy data.",
  ],

  timeline: [
    { when: "Earlier", title: "Data science & deep learning projects",
      text: "Churn prediction with XGBoost, real-time emotion detection with CNNs, tumour classification with EfficientNet + Grad-CAM." },
    { when: "Until Aug 2026", title: "Research Intern — KIST",
      text: "Spent the internship inside one of Korea's flagship research institutes. Fell in love with the lab life." },
    { when: "Sep 2026 →", title: "M.S. — UST–KIST School",
      text: "Started my master's at the University of Science and Technology, through the KIST campus." },
    { when: "Now", title: "Student Researcher — KIST",
      text: "Doing research while doing the masters. TODO: add one line about your research topic here." },
  ],

  projects: [
    { title: "Bank Customer Churn Prediction", tag: "ML · Python",
      text: "Predictive model using scikit-learn and XGBoost to understand customer behaviour and flag churn early, so retention can be targeted with data.",
      link: "https://github.com/DarinDJ/Bank_Customer_Churn" },
    { title: "Facial Recognition & Emotion Detection", tag: "Deep Learning · CV",
      text: "CNN built with OpenCV, TensorFlow and Keras that recognises faces and reads emotion in real time.",
      link: "https://github.com/DarinDJ" },               // TODO: link the exact repo
    { title: "Brain Tumor Classification + Grad-CAM", tag: "Medical AI",
      text: "EfficientNet classifier with Grad-CAM heatmaps so you can see where the model is looking, not just what it predicts.",
      link: "https://github.com/DarinDJ" },               // TODO: link the exact repo
    { title: "KIST Research", tag: "In progress",
      text: "Current work at KIST. TODO: add a public-safe description (or keep the mystery).",
      link: "" },
  ],

  // group: which hub the node clings to
  skills: {
    "Languages": ["Python", "C", "Java", "JavaScript", "SQL"],
    "ML / AI":   ["TensorFlow", "Keras", "scikit-learn", "XGBoost", "OpenCV"],
    "Data":      ["Power BI", "MySQL", "MongoDB", "Jupyter"],
    "Web":       ["Node.js", "React"],
  },

  links: [
    { label: "LinkedIn",  href: "https://www.linkedin.com/in/darin-davis-johnson/" },
    { label: "GitHub",    href: "https://github.com/DarinDJ" },
    { label: "Instagram", href: "https://www.instagram.com/darin_john7" },
    // TODO: add { label: "Email", href: "mailto:you@example.com" }
    { label: "Résumé",    href: "assets/Resume-old.pdf" }, // TODO: swap in an updated résumé
  ],
};
