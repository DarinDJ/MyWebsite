import React from "react";
import { Row } from "react-bootstrap";

function Leetcode() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
      <h1 className="project-heading" style={{ paddingBottom: "20px" }}>
        LeetCode <strong className="purple">Calendar</strong>
      </h1>
      <img
        src="https://leetcode-stats.vercel.app/api?username=2Orqc6uJ87&theme=dark"  // Replace with your username
        alt="LeetCode Stats"
        width="800"
        height="400"
        style={{ borderRadius: "8px" }}
      />
    </Row>
  );
}

export default Leetcode;
