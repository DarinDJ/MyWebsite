import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import bankChurnImg from "../../Assets/Projects/churn.png"; 
import faceRecognitionImg from "../../Assets/Projects/emotion.png"; 

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Projects</strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={6} className="project-card">
            <ProjectCard
              imgPath={bankChurnImg}
              isBlog={false}
              title="Bank Customer Churn Prediction"
              description="Developed a predictive model using Python, Scikit-learn, and XGBoost to analyze customer behavior and predict churn. Improved retention strategies using data insights."
              ghLink="https://github.com/DarinDJ/Bank_Customer_Churn"
            />
          </Col>

          <Col md={6} className="project-card">
            <ProjectCard
              imgPath={faceRecognitionImg}
              isBlog={false}
              title="Facial Recognition & Emotion Detection"
              description="Built a CNN-based deep learning model using OpenCV, TensorFlow, and Keras to recognize faces and detect emotions in real-time with high accuracy."
              
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
