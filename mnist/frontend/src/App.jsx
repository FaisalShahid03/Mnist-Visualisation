import React, { useState } from "react";
// import NeuralNetwork from "./components/NeuralNetwork.jsx";
import DrawingCanvas from "./components/DrawingCanvas";

const App = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1
        style={{
          borderBottom: "3px solid rgb(180, 209, 226)",  // Refined underline color (teal blue)
          fontSize: "36px",
          fontWeight: "600",
          color: "#333",
          letterSpacing: "1px",
          textTransform: "uppercase",
          textAlign: "center",
          margin: "20px 0",
          fontFamily: "'Roboto', sans-serif",
          transition: "all 0.3s ease-in-out",
        }}
      >
        MNIST Neural Network Visualization
      </h1>
      <h2
        style={{
          fontWeight: "400",
          fontSize: "18px",
          color: "#555",
          position: "relative",
          top: "-20px",
          fontFamily: "'Roboto', sans-serif",
          textAlign: "center",
          letterSpacing: "0.5px",
          opacity: "0.8",
          transition: "all 0.3s ease-in-out",
        }}
      >
        Faisal Shahid
      </h2>
      <DrawingCanvas />
      {/* <NeuralNetwork inputData={inputData} /> */}
    </div>
  );
};

export default App;
