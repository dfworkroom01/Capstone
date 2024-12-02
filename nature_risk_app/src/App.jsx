import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs"; // Import exceljs

// Register the necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [data, setData] = useState(
    Array(30).fill({ water_level: "", rainfall: "", temperature: "" })
  );
  const [droughtRisks, setDroughtRisks] = useState([]);
  const [error, setError] = useState("");
  const [chartInstance, setChartInstance] = useState(null); // Store Chart.js instance to add chart to PDF
  const [loggedIn, setLoggedIn] = useState(true); //The user loggedin

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token or session data from localStorage
    setLoggedIn(false); // Update login state
    window.location.href = "http://localhost:5174/"; 
  };

  // Handle changes in input data
  const handleInputChange = (index, field, value) => {
    const updatedData = [...data]; // Make a copy of the data
    updatedData[index] = {
      ...updatedData[index], // Copy the data for the specific day
      [field]: value, // Update the specific field for that day
    };
    setData(updatedData); // Set the updated state
  };

  // Handle form submission to predict drought risk for all 30 days
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const allRisks = [];

      // Send each day's data to backend API for prediction
      for (const dayData of data) {
        const response = await axios.post('http://127.0.0.1:5001/predict', {
          water_level: parseFloat(dayData.water_level),
          rainfall: parseFloat(dayData.rainfall),
          temperature: parseFloat(dayData.temperature),
        });
        allRisks.push(response.data.drought_risk);
      }

      setDroughtRisks(allRisks);
      setError("");
    } catch (err) {
      setError("Error making predictions");
      setDroughtRisks([]);
      console.error(err);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header (dark blue)
    doc.setFillColor(0, 51, 102); // Dark blue color
    doc.rect(0, 0, 210, 20, 'F'); // Draw header rectangle
    doc.setTextColor(255, 255, 255); // Set text color to white for contrast
    doc.setFontSize(18);
    doc.text("Drought Risk Predictions for 30 Days", 20, 15);
  
    // Add daily data as a table
    const tableData = data.map((dayData, index) => [
      `Day ${index + 1}`,
      dayData.water_level,
      dayData.rainfall,
      dayData.temperature,
      droughtRisks[index],
    ]);
  
    const tableColumns = ["Day", "Water Level", "Rainfall", "Temperature", "Drought Risk"];
  
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 30,
      margin: { top: 10 },
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
    });
  
    let yPosition = doc.lastAutoTable.finalY + 10; // Position after the table
  
    // Add the chart (if there’s enough space, else add a new page)
    if (yPosition + 100 > 290) { // Check if chart will overflow
      doc.addPage();
      yPosition = 20; // Reset yPosition for new page
    }
  
    if (chartInstance) {
      const chartCanvas = chartInstance.canvas;
      const imgData = chartCanvas.toDataURL("image/png");
      const chartHeight = 100; // Desired height for the chart
      doc.addImage(imgData, "PNG", 20, yPosition, 170, chartHeight); // Add chart
      yPosition += chartHeight + 10; // Update yPosition after chart
    }
  
    // Check if there's enough space for the conclusion, else add a new page
    if (yPosition + 30 > 290) { // Check if conclusion text will overflow
      doc.addPage();
      yPosition = 20; // Reset yPosition for new page
    }
  
    // Add Conclusion Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 139);
    doc.text("Conclusion:", 20, yPosition);
    let conclusionY = yPosition + 10;
  
    // Count the occurrences of each risk level
    const lowCount = droughtRisks.filter((risk) => risk === "low").length;
    const moderateCount = droughtRisks.filter((risk) => risk === "moderate").length;
    const highCount = droughtRisks.filter((risk) => risk === "high").length;
  
    // Basic conclusion text with dynamic analysis
    let overallSummary = "Based on the 30 days of data, the drought risk fluctuated throughout the month.";
  
    // Customize conclusion based on the number of low, moderate, and high risk days
    if (highCount > lowCount && highCount > moderateCount) {
      overallSummary = "The analysis suggests that high drought risk was prevalent. Drought alert.";
    } else if (lowCount > highCount && lowCount > moderateCount) {
      overallSummary = "The drought risk was generally low, which suggests a minimal threat of drought.";
    } else if (moderateCount > lowCount && moderateCount > highCount) {
      overallSummary = "The analysis indicates moderate drought risk. Caution in water management to avoid potential drought conditions.";
    } else {
      overallSummary = "The drought risk varied, with a mix of low, moderate, and high risks over the 30 days. Continuous monitoring and careful management of water resources are essential.";
    }
  
    // Creating the dynamic conclusion text
    const conclusionText = `
      Total Days with Low Risk: ${lowCount}
      Total Days with Moderate Risk: ${moderateCount}
      Total Days with High Risk: ${highCount}
      
      Overall Drought Risk Summary:
      ${overallSummary}
      Based on the data, careful planning is required to protect assets.
      Ensure proper water management strategies suit the risk levels.
    `;
    
    // Split the conclusion text into lines
    const conclusionLines = doc.splitTextToSize(conclusionText, 170);
  
    // The conclusion is left-aligned (default behavior)
    doc.text(conclusionLines, 20, conclusionY, { align: 'left' });
  
    // Save the PDF file
    doc.save("drought-risk-30-days.pdf");
  };
  

  // Handle file input for uploading the Excel file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.getWorksheet(1); // Assuming the data is in the first sheet

        const updatedData = [];
        worksheet.eachRow((row, rowIndex) => {
          if (rowIndex <= 30) {
            updatedData.push({
              water_level: row.getCell(1).value,
              rainfall: row.getCell(2).value,
              temperature: row.getCell(3).value,
            });
          }
        });

        setData(updatedData); // Autofill data
      } catch (error) {
        setError("Error reading Excel file");
        console.error(error);
      }
    }
  };

  // Chart.js data
  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Drought Risk",
        data: droughtRisks.map((risk) =>
          risk === "low" ? 1 : risk === "moderate" ? 2 : 3
        ), // Map to numeric values
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">EarthAnalytics: Drought Risk Prediction</h1>

      {/* Logout Button */}
      {loggedIn && (
        <Button variant="danger" onClick={handleLogout} className="mb-4">
          Logout
        </Button>
      )}

      {/* Excel File Upload */}
      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Label>Upload Excel File</Form.Label>
        <Form.Control
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
        />
      </Form.Group>

      {/* Form for Data Input */}
      <Form onSubmit={handleSubmit}>
        <Row>
          {data.map((dayData, index) => (
            <Col key={index} md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Day {index + 1}</Card.Title>
                  <Form.Group controlId={`waterLevel-${index}`}>
                    <Form.Label>Water Level</Form.Label>
                    <Form.Control
                      type="number"
                      value={dayData.water_level}
                      onChange={(e) =>
                        handleInputChange(index, "water_level", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group controlId={`rainfall-${index}`}>
                    <Form.Label>Rainfall</Form.Label>
                    <Form.Control
                      type="number"
                      value={dayData.rainfall}
                      onChange={(e) =>
                        handleInputChange(index, "rainfall", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group controlId={`temperature-${index}`}>
                    <Form.Label>Temperature</Form.Label>
                    <Form.Control
                      type="number"
                      value={dayData.temperature}
                      onChange={(e) =>
                        handleInputChange(index, "temperature", e.target.value)
                      }
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Button variant="primary" type="submit" className="mt-4">
          Submit
        </Button>
      </Form>

      {/* Error Message */}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {/* Chart Display */}
      {droughtRisks.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Line data={chartData}  ref={(chart) => setChartInstance(chart)} options={{ responsive: true }} />
          </Col>
        </Row>
      )}

      {/* Download PDF Button */}
      {droughtRisks.length > 0 && (
        <Button variant="success" onClick={downloadPDF} className="mt-3">
          Download PDF
        </Button>
      )}
    </Container>
  );
}


export default App;
