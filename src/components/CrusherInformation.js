import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './CrusherInformation.css';

function CrusherInformation() {
  const [crusherDetails, setCrusherDetails] = useState(null);
  const [timeInterval, setTimeInterval] = useState('day');
  const { id } = useParams();

  // Use this function to determine how many entries to display based on the selected interval

  const generatePDF = () => {
    const canvasOptions = {
      scale: 1, // Adjust scale to increase/decrease image quality
      useCORS: true, // This might be needed for images in the chart
      // other options...
    };
    const chartContainer = document.querySelector('#chartContainer');
    html2canvas(chartContainer, canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Initialize jsPDF - you can adjust the orientation and unit
      const pdf = new jsPDF('landscape', 'pt', 'a4'); // Adjust 'a4' to another format if needed

      // Calculate the number of pages needed
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = pageWidth / imgWidth;
      let heightLeft = imgHeight * ratio;

      let position = 0;

      // Add image to the first page
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight * ratio);
      heightLeft -= pageHeight;

      // Add new pages if the content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight * ratio);
        heightLeft -= pageHeight;
      }

      pdf.save('report.pdf');
    });
  };
  useEffect(() => {
    const userLogin = localStorage.getItem('userLogin');
    if (userLogin) {
      axios
        .get(`${API_ENDPOINTS.getIntegrator}?login=${userLogin}`, {
          headers: { From: userLogin, 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const crusher = response.data.integrators.find(
            (device) => device.PK === id
          );
          setCrusherDetails(crusher);
        })
        .catch((error) => {
          console.error('Error fetching crusher details', error);
        });
    }
  }, [id]);

  const filterDataByTimeInterval = (data) => {
    const now = new Date();
    let filteredData = data;

    switch (timeInterval) {
      case 'day':
        filteredData = data.filter(
          (entry) =>
            new Date(entry.utcDateTime).toDateString() === now.toDateString()
        );
        break;
      case 'week':
        const lastWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        filteredData = data.filter(
          (entry) => new Date(entry.utcDateTime) >= lastWeek
        );
        break;
      case 'month':
        const lastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        filteredData = data.filter(
          (entry) => new Date(entry.utcDateTime) >= lastMonth
        );
        break;
      default:
      // No additional filtering
    }
    return filteredData;
  };

  const getDisplayData = (data) => {
    switch (timeInterval) {
      case 'day':
        // Return an array containing only the last record
        return data.slice(-1);
      case 'week':
        // Return an array of the last 7 records
        return data.slice(-7);
      case 'month':
        // Return an array of the last 30 records
        return data.slice(-30);
      default:
        return data;
    }
  };

  const displayData = crusherDetails
    ? getDisplayData(filterDataByTimeInterval(crusherDetails.IntegratorEntries))
    : [];

  const getLatestData = (filteredData) => {
    switch (timeInterval) {
      case 'day':
        return filteredData.length > 0
          ? [filteredData[filteredData.length - 1]]
          : [];
      case 'week':
        return filteredData.slice(-7); // Last 7 entries
      case 'month':
        return filteredData.slice(-30); // Last 30 entries
      default:
        return filteredData;
    }
  };

  const getChartData = (key) => {
    if (!crusherDetails) return {};
    const filteredData = getLatestData(
      filterDataByTimeInterval(crusherDetails.IntegratorEntries)
    );

    const chartLabels = filteredData.map((entry) =>
      new Date(entry.utcDateTime).toLocaleDateString()
    );
    const chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: key,
          data: filteredData.map((entry) => entry[key]),
          borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
          })`,
          tension: 0.1,
        },
      ],
    };
    return chartData;
  };
  const latestData = crusherDetails
    ? getLatestData(filterDataByTimeInterval(crusherDetails.IntegratorEntries))
    : null;

  if (!crusherDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className='crusher-container'>
      <h2>Szczegóły Kruszarki</h2>
      <table>
        <tbody>
          {/* Row for "Location" and "Serial Number" */}
          <tr>
            <td>Lokalizacja:</td>
            <td>{crusherDetails.location}</td>
          </tr>
          <tr>
            <td>Serial Number:</td>
            <td>{crusherDetails.serialNumber}</td>
          </tr>

          {/* Separate row for headers "Date", "Total", "Rate", "Speed" */}
          <tr>
            <th>Date</th>
            <th>Total</th>
            <th>Rate</th>
            <th>Speed</th>
          </tr>

          {/* Rows for each entry */}
          {displayData.map((entry, index) => (
            <tr key={index}>
              <td>{new Date(entry.utcDateTime).toLocaleDateString()}</td>
              <td>{entry.total}</td>
              <td>{entry.rate}</td>
              <td>{entry.speed}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='form-section'>
        <label htmlFor='timeInterval'>Select Time Interval:</label>
        <select
          id='timeInterval'
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value)}
        >
          <option value='day'>Day</option>
          <option value='week'>Week</option>
          <option value='month'>Month</option>
        </select>
      </div>

      <div id='chartContainer'>
        <h3>Total Chart</h3>
        <Line data={getChartData('total')} />
        <h3>Rate Chart</h3>
        <Line data={getChartData('rate')} />
        <h3>Speed Chart</h3>
        <Line data={getChartData('speed')} />
      </div>

      <button onClick={generatePDF}>Generate PDF Report</button>
    </div>
  );
}

export default CrusherInformation;
