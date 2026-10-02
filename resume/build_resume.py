"""Builds assets/Resume.pdf in the same template as the original résumé
(one page, Times, letter-spaced section headers with rules, bold org left /
location right, italic dates right).

Edit CONTENT below and run:   python resume/build_resume.py
Anything written as [[like this]] is a placeholder: it is highlighted yellow so
it cannot be missed, and the script refuses to write the final file while any
remain unless you pass --draft.
"""
import io, re, sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, HRFlowable

OUT = Path(__file__).resolve().parent.parent / "assets" / "Resume.pdf"

NAME = "Darin Davis Johnson"
CONTACT = ('(+91) 9380321413 | <link href="mailto:darinjohn23@gmail.com" color="#0563c1">darinjohn23@gmail.com</link>'
           ' | LinkedIn - darin-davis-johnson | GitHub - DarinDJ | darindj.github.io/MyWebsite')

# (kind, ...) rows. org rows: ("org", left, right); role rows: ("role", left, right); bullets: ("b", text)
CONTENT = [
 ("section", "PROFESSIONAL EXPERIENCE"),
 ("org",  "KOREA INSTITUTE OF SCIENCE AND TECHNOLOGY (KIST)", "Seoul, South Korea"),
 ("role", "Student Researcher (UST–KIST M.S. Program)", "September 2026 – Present"),
 ("b", "Developing research software in Python to process, analyze and visualize mouse neural-recording and behavioral data, "
       "turning experimental data into reproducible analysis pipelines."),
 ("b", "Applying AI and machine-learning methods to mouse neuroscience data as part of the M.S. in AI and Robotics."),
 ("role", "Research Intern", "May 2026 – August 2026"),
 ("b", "Built an end-to-end Python pipeline (PSD, artifact masking, Hilbert-envelope burst detection) to analyze LFP/EEG "
       "recordings from the mPFC and basolateral amygdala in a mouse threat–escape experiment."),
 ("b", "Detected and visually validated theta, beta and gamma bursts, then compared burst features across four 60-second "
       "experimental conditions using statistical analysis (SciPy, statsmodels)."),
 ("b", "Aligned neural bursts with tracked mouse and spider-robot behavior and analyzed beta–gamma–theta cross-frequency "
       "coupling to link brain dynamics to threat-driven behavior."),
 ("org",  "MICROHARD SERVICES PVT LTD.", "Bengaluru, India"),
 ("role", "Software Engineering Intern", "May 2025 - June 2025"),
 ("b", "Built backend logic in Python and SQL for an internal Asset Tracking Application, enabling real-time updates "
       "across 100+ items."),
 ("b", "Reduced manual tracking overhead by ~40% while collaborating with the development team on functional "
       "components and design."),
 ("org",  "HINDUSTAN AERONAUTICS LIMITED (HAL)", "Bengaluru, India"),
 ("role", "Software Engineering Intern", "April 2024 - May 2024"),
 ("b", "Developed a mission-critical Java application (Eclipse IDE) for helicopter pilots, delivering real-time data "
       "visualization and seamless system communication."),
 ("b", "Engineered a secure LAN-based interface to receive and display real-time operational data from an external "
       "system, adhering to strict security protocols."),
 ("b", "Optimized data handling and UI responsiveness, reducing latency by 30%."),
 ("b", "Delivered 80% of the assigned scope within one month of a two-month timeline, accelerating completion by 50%."),

 ("section", "EDUCATION"),
 ("org",  "UNIVERSITY OF SCIENCE AND TECHNOLOGY (UST) – KIST SCHOOL", "Seoul, South Korea"),
 ("role", "Master of Science in AI and Robotics", "September 2026 - Present"),
 ("b", "Research focus: applied AI for neuroscience and research software engineering."),
 ("org",  "CHRIST UNIVERSITY", "Bengaluru, India"),
 ("role", "Bachelor of Technology in Computer Science and Engineering with Data Science", "August 2022 - April 2026"),
 ("b", "Average GPA: 3.7/4 | Relevant coursework: Data Structures, Algorithms, AI, ML, Databases, SQL."),

 ("section", "CERTIFICATIONS AND PROJECTS"),
 ("org",  "BANK CUSTOMER CHURN PREDICTION", "March 2024", "date"),
 ("b", "Compared six classifiers (logistic regression, SVM, KNN, decision tree, random forest, gradient boosting) on "
       "10,000 customer records to predict churn, handling class imbalance with resampling; random forest performed best."),
 ("b", "Evaluated with accuracy, precision, recall and F1, and wrapped the model in a Tkinter app for interactive predictions."),
 ("org",  "FACIAL RECOGNITION & EMOTION DETECTION", "September 2024", "date"),
 ("b", "Built a CNN-based deep-learning system (OpenCV, TensorFlow, Keras) that detects faces and classifies emotions in real time."),
 ("org",  "KERALEEYAM ASSOCIATION WEBSITE", "February 2025", "date"),
 ("b", "Built and deployed a full-stack website (React.js, TypeScript, Supabase) for 50+ association members; live at keraleeyam.vercel.app."),
 ("b", "Automated database integration for dynamic content and user interactions, cutting manual effort by 60%; "
       "collaborated in a team of 5 with 100% on-time deployment."),
 ("org",  "BRITISH AIRWAYS DATA SCIENCE VIRTUAL EXPERIENCE – FORAGE", "July 2023", "date"),
 ("b", "Scraped and analyzed airline customer data (Python, BeautifulSoup) and built a logistic-regression model forecasting "
       "buying behavior with ~90% accuracy; visualized booking trends with Matplotlib."),
 ("cert", "NoSQL and DBaaS 101 - IBM", "October 2023"),
 ("cert", "INTRODUCTION TO CYBERSECURITY - CISCO", "June 2023"),

 ("section", "SKILLS"),
 ("skill", "Languages", "Python, Java, JavaScript, TypeScript, SQL"),
 ("skill", "ML & Data", "scikit-learn, TensorFlow, Keras, OpenCV, NumPy, pandas, SciPy, statsmodels, Matplotlib, Power BI"),
 ("skill", "Neuro & Signals", "MNE-Python, power spectral density, Hilbert transform, burst detection, cross-frequency coupling"),
 ("skill", "Tools", "Git, REST APIs, React.js, Supabase, MySQL, Jupyter, Raspberry Pi"),
]

PLACEHOLDER = re.compile(r"\[\[(.+?)\]\]")
def fmt(t):
    t = t.replace("&", "&amp;") if "<link" not in t else t
    return PLACEHOLDER.sub(r'<font backColor="#FFF176">[\1]</font>', t)

def build(buf, size):
    lead = size * 1.17
    W = letter[0] - 2 * 28 - 12   # frame padding is 6pt each side
    base = ParagraphStyle("b", fontName="Times-Roman", fontSize=size, leading=lead)
    sty = {
      "name": ParagraphStyle("n", parent=base, fontName="Times-Bold", fontSize=24, leading=27, alignment=TA_CENTER),
      "contact": ParagraphStyle("c", parent=base, alignment=TA_CENTER),
      "sec": ParagraphStyle("s", parent=base, fontName="Times-Bold", fontSize=size + 1.1, leading=size + 3, charSpace=2, spaceBefore=size * .55),
      "org": ParagraphStyle("o", parent=base, fontName="Times-Bold"),
      "orgR": ParagraphStyle("oR", parent=base, fontName="Times-Bold", alignment=TA_RIGHT),
      "role": base,
      "date": ParagraphStyle("d", parent=base, fontName="Times-Italic", alignment=TA_RIGHT),
      "b": ParagraphStyle("bu", parent=base, leftIndent=18, bulletIndent=7, spaceBefore=.6),
    }
    story = [Paragraph(NAME, sty["name"]), Paragraph(CONTACT, sty["contact"])]
    def row(l, ls, r, rs):
        t = Table([[Paragraph(fmt(l), sty[ls]), Paragraph(fmt(r), sty[rs])]], colWidths=[W - 150, 150])
        t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                               ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
        return t
    first_org_in_section = False
    for r in CONTENT:
        k = r[0]
        if k == "section":
            story += [Paragraph(r[1], sty["sec"]), HRFlowable(width="100%", thickness=.7, color="black", spaceBefore=1, spaceAfter=size * .25)]
        elif k == "org":
            if len(r) > 3:   # project line: bold title, italic date on the same row
                story.append(Spacer(1, size * .22)); story.append(row(r[1], "org", r[2], "date"))
            else:
                story.append(Spacer(1, size * .22)); story.append(row(r[1], "org", r[2], "orgR"))
        elif k == "role": story.append(row(r[1], "role", r[2], "date"))
        elif k == "b": story.append(Paragraph(fmt(r[1]), sty["b"], bulletText="•"))
        elif k == "cert": story.append(row("<b>%s</b>" % r[1], "role", r[2], "date"))
        elif k == "skill": story.append(Paragraph("<b>%s:</b> %s" % (r[1], fmt(r[2])), base))
    doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=28, rightMargin=28, topMargin=22, bottomMargin=20,
                            title="Darin Davis Johnson — Résumé", author="Darin Davis Johnson")
    doc.build(story)
    return doc.page

def main():
    draft = "--draft" in sys.argv
    left = [m for t in CONTENT for m in PLACEHOLDER.findall(" ".join(map(str, t)))]
    if left and not draft:
        print(f"{len(left)} placeholder(s) still unfilled — fill them in or run with --draft:")
        for m in left: print("  •", m)
        sys.exit(1)
    for size in [10.8, 10.6, 10.4, 10.2, 10.0, 9.8, 9.6, 9.4]:
        buf = io.BytesIO()
        if build(buf, size) == 1:
            OUT.write_bytes(buf.getvalue()); print(f"wrote {OUT} at {size}pt, 1 page, {len(left)} placeholder(s)"); return
    print("could not fit on one page — trim content"); sys.exit(2)

main()
