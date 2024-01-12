import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

function CrusherInformation() {
  const [crusherDetails, setCrusherDetails] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    // Załaduj dane kruszarki na podstawie ID
    const userLogin = localStorage.getItem('userLogin');
    if (userLogin) {
      axios
        .get(`${API_ENDPOINTS.getIntegrator}?login=${userLogin}`, {
          headers: { From: userLogin, 'Content-Type': 'application/json' },
        })
        .then((response) => {
          // Filtruj dane kruszarki na podstawie ID
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

  if (!crusherDetails) {
    return <div>Loading...</div>;
  }

  // Tutaj możesz wyświetlić szczegółowe dane kruszarki
  return (
    <div>
      <h2>Szczegóły Kruszarki</h2>
      {/* Wyświetl informacje o kruszarce */}
      <p>Serial Number: {crusherDetails.serialNumber}</p>
      <p>Location: {crusherDetails.location}</p>
      {/* Wyświetl szczegółowe dane */}
      {crusherDetails.IntegratorEntries.map((entry, index) => (
        <div key={index}>
          <p>Total: {entry.total}</p>
          <p>Rate: {entry.rate}</p>
          <p>Speed: {entry.speed}</p>
          {/* Inne dane */}
        </div>
      ))}
    </div>
  );
}

export default CrusherInformation;
