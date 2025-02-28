import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple">Darin Davis Johnson </span>
            from <span className="purple"> Bangalore, India.</span>
            <br />
            I am a third-year Computer Science and Engineering student specializing in Data Science at Christ University.
            <br />
            Passionate about software development and problem-solving, I have hands-on experience in building applications,
            including a software solution for <span className="purple">HAL </span>during my internship.
            <br />
            <br />
            Apart from coding, some other activities that I love doing!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Deriving Insights
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling
            </li>
            <li className="about-activity">
              <ImPointRight /> Playing Competitive Games
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)" }}>
            "Code is like humor. When you have to explain it, it’s bad."{" "}
          </p>
          <footer className="blockquote-footer">Cory House</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
