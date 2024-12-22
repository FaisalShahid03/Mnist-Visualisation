import React, { useState } from "react";

const seededRandom = (seed) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const DrawingCanvas = () => {
  const [grid, setGrid] = useState(Array(28).fill().map(() => Array(28).fill(0)));
  const [dense1Layer, setDense1Layer] = useState(Array(25).fill(0));
  const [dense2Layer, setDense2Layer] = useState(Array(25).fill(0));
  const [outputLayer, setOutputLayer] = useState(Array(10).fill(0));
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
    updateGrid(row, col);
  };

  const handleMouseMove = (row, col) => {
    if (isDrawing) {
      updateGrid(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const colors = {
    1: "rgb(0, 51, 51)",    // Darker Teal for full intensity
    0.5: "rgb(64, 112, 115)", // Muted Teal for half intensity
    0: "rgb(255, 255, 255)",   // White for default
  };
  
  const updateGrid = (row, col) => {
    const newGrid = grid.map((rowArr, rowIndex) =>
      rowArr.map((cell, colIndex) => {
        const isCenter = rowIndex === row && colIndex === col;
        const isAdjacent =
          (rowIndex === row && Math.abs(colIndex - col) === 1) ||
          (colIndex === col && Math.abs(rowIndex - row) === 1);

        if (isCenter) {
          return 1; // Full intensity
        } else if (isAdjacent) {
          return Math.max(cell, 0.5); // Half intensity
        }
        return cell; // Retain the existing value
      })
    );
    setGrid(newGrid);
    fetchPrediction(newGrid);
  };

  const renderGrid = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(28, 10px)",
        gap: "1px",
        marginTop: "-60px",
      }}
      onMouseLeave={handleMouseUp}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: colors[cell], // Assign color dynamically
              border: "1px solid #ccc",
            }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
            onMouseUp={handleMouseUp}
          ></div>
        ))
      )}
    </div>
  );

  const fetchPrediction = async (currentGrid) => {
    const inputData = currentGrid.flat().map((cell) => {
      if (cell === 1) return 255;
      if (cell === 0.5) return 128;
      return 0;
    });

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputData }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      const { dense_layer_outputs } = data;

      setDense1Layer(dense_layer_outputs[0][0]);
      setDense2Layer(dense_layer_outputs[1][0]);
      setOutputLayer(dense_layer_outputs[2][0]);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  const resetGrid = () => {
    setGrid(Array(28).fill().map(() => Array(28).fill(0)));
    setDense1Layer(Array(25).fill(0));
    setDense2Layer(Array(25).fill(0));
    setOutputLayer(Array(10).fill(0));
  };

  const renderLayer = (layerData, layerId) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${layerData.length}, 30px)`,
        gap: "20px",
        position: "relative",
        marginBottom: "50px",
        paddingBottom: "30px",
      }}
    >
      {layerData.map((value, index) => (
        <div
          key={index}
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: `rgb(0, 109, 108, ${value})`,
            border: "2px solid #36454F",
            borderRadius: "5px",
          }}
          id={`${layerId}-${index}`}
        ></div>
      ))}
    </div>
  );

  const renderConnections = (fromLayer, toLayer, fromLayerId, toLayerId, seed) => {
    const boxSize = 30; // Width and height of each box
    const horizontalGap = 20; // Gap between boxes within a layer
    const verticalGap = 102; // Correct vertical spacing between layers
    const layerSpacing = verticalGap + boxSize;

    const connections = [];
    let currentSeed = seed;

    const getXCoordinate = (layer, index) => {
      const totalWidth = layer.length * (boxSize + horizontalGap) - horizontalGap;
      const startX = (1200 - totalWidth) / 2; // Center-align the layer
      return startX + index * (boxSize + horizontalGap) + boxSize / 2;
    };

    const getYCoordinate = (layerId, position) => {
      const baseY = (layerId - 1) * layerSpacing + 3;
      return position === "bottom" ? baseY + boxSize + 2 : baseY;
    };

    fromLayer.forEach((_, fromIndex) => {
      const x1 = getXCoordinate(fromLayer, fromIndex);
      const y1 = getYCoordinate(fromLayerId, "bottom"); // Bottom of the box

      // Determine the number of connections and their indices using seeded randomness
      const numConnections = Math.floor(seededRandom(currentSeed++) * 5) + 3; // Random number between 2 and 5
      const randomConnections = Array.from(
        { length: numConnections },
        () => Math.floor(seededRandom(currentSeed++) * toLayer.length) // Random target index
      );

      randomConnections.forEach((toIndex) => {
        const x2 = getXCoordinate(toLayer, toIndex);
        const y2 = getYCoordinate(toLayerId, "top"); // Top of the box

        connections.push(
          <line
            key={`${fromLayerId}-${fromIndex}-to-${toLayerId}-${toIndex}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ stroke: "rgb(168, 168, 168)", strokeWidth: 2 }}
            />
        );
      });
    });

    return connections;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <svg width="1200" height="800" style={{ position: "absolute", zIndex: -1 }}>
        {renderConnections(outputLayer, dense2Layer, 1, 2, 42)}
        {renderConnections(dense2Layer, dense1Layer, 2, 3, 42)}
      </svg>

      {/* Render outputLayer with numbers above each box */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${outputLayer.length}, 30px)`,
          gap: "20px",
          marginBottom: "80px",
          position: "relative", // To position the numbers relative to the boxes
        }}
      >
        {outputLayer.map((value, index) => (
          <div key={index} style={{ position: "relative" }}>
            {/* Number above each box in the outputLayer */}
            <div
              style={{
                position: "absolute",
                top: "-20px", // Position the number slightly above the box
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {index}
            </div>

            {/* The box itself */}
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: `rgba(0, 109, 108, ${value})`,
                border: "2px solid #36454F",
                borderRadius: "5px",
              }}
              id={`outputLayer-${index}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Render other layers */}
      {renderLayer(dense2Layer, "dense2Layer")}
      {renderLayer(dense1Layer, "dense1Layer")}

      {/* Render the drawing canvas */}
      {renderGrid()}
      <button
        onClick={resetGrid}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#FFFFFF",  // White background
          color: "#000000",  // Dark Teal text color
          border: "2px solid rgb(0, 0, 0)",  // Dark Teal border
          borderRadius: "5px",  // Rounded corners
          fontWeight: "bold",  // Bold text for emphasis
          textTransform: "uppercase",  // Uppercase text for style
          transition: "all 0.1s ease",  // Smooth transition for hover effect
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#006D6C";  // Dark Teal background on hover
          e.target.style.border = " #006D6C";  // Dark Teal background on hover
          e.target.style.color = "#FFFFFF";  // White text on hover
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#FFFFFF";  // Revert to White background
          e.target.style.border = "2px solid rgb(0, 0, 0)";  // Dark Teal background on hover
          e.target.style.color = "#000000";  // Revert text color to Dark Teal
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default DrawingCanvas;
