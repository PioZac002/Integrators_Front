import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import './DeviceList.css';
import 'chart.js/auto';

function DeviceList() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [location, setLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [devices, setDevices] = useState([]); // Tutaj zdefiniowane stan devices
  const [userID, setUserID] = useState(null);
  const navigate = useNavigate();
  const [timeInterval, setTimeInterval] = useState('1h'); // Nowy stan dla interwału czasowego
  const [showAddToIntegratorGroupForm, setShowAddToIntegratorGroupForm] =
    useState(false);
  const [selectedIntegratorID, setSelectedIntegratorID] = useState('');
  const [selectedGroupID, setSelectedGroupID] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [integratorGroupName, setIntegratorGroupName] = useState('');
  const [showAddWorkerToGroupForm, setShowAddWorkerToGroupForm] =
    useState(false);
  const [selectedWorkerID, setSelectedWorkerID] = useState('');
  const [integratorGroups, setIntegratorGroups] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [groupDetails, setGroupDetails] = useState([]);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isService, setIsService] = useState(false);
  // Funkcje, które już są

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.getWorkersEndpoint, {
        headers: { from: userID, 'Content-Type': 'application/json' },
      });
      if (response.status === 200 && response.data.workers) {
        setWorkers(response.data.workers);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania pracowników:', error);
    }
  };

  const fetchIntegratorGroups = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.getIntegratorGroupEndpoint,
        {
          headers: { From: userID, 'Content-Type': 'application/json' },
        }
      );
      if (response.status === 200 && response.data.integratorGroups) {
        setIntegratorGroups(response.data.integratorGroups);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania grup integratorów:', error);
    }
  };
  const handleCreateGroup = async () => {
    if (!integratorGroupName) {
      alert('Podaj nazwę grupy integratorów');
      return;
    }

    try {
      const response = await axios.post(
        API_ENDPOINTS.integratorGroupEndpoint,
        JSON.stringify({
          integratorGroupName,
          userID: userID,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Grupa integratorów została utworzona');
        setIntegratorGroupName('');
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia grupy integratorów:', error);
      alert('Nie udało się utworzyć grupy integratorów');
    }
  };
  const handleAddToIntegratorGroup = async () => {
    if (!selectedIntegratorID || !selectedGroupID) {
      alert('Proszę wybrać integratora i grupę');
      return;
    }
    // Find the selected device
    const selectedDevice = devices.find(
      (device) => device.PK === selectedIntegratorID
    );

    // Check if the selected device is already in a group
    // Sprawdź, czy wybrany integrator jest już w grupie
    if (selectedDevice && selectedDevice.integratorGroup) {
      const groupName = integratorGroups.find(
        (group) => group.PK === selectedDevice.integratorGroup
      )?.integratorGroupName;
      if (groupName) {
        alert(`Ten integrator należy już do grupy: ${groupName}`);
        return;
      }
    }

    try {
      const response = await axios.put(
        API_ENDPOINTS.addIntegratorToGroupEndpoint,
        JSON.stringify({
          integratorID: selectedIntegratorID,
          integratorGroupID: selectedGroupID,
          userID: userID,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Integrator został dodany do grupy');
      }
    } catch (error) {
      console.error('Błąd podczas dodawania integratora do grupy:', error);
      alert('Nie udało się dodać integratora do grupy');
    }
  };

  const handleAddWorkerToGroup = async () => {
    if (!selectedWorkerID || !selectedGroupID) {
      alert('Proszę wybrać pracownika i grupę');
      return;
    }

    try {
      const response = await axios.put(
        'https://jfhnwg5jfl.execute-api.eu-central-1.amazonaws.com/prod/editUser',
        JSON.stringify({
          integratorGroupID: selectedGroupID,
          userID: userID,
          addedUserID: selectedWorkerID,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Pracownik został dodany do grupy');
      } else {
        alert('Nie udało się dodać pracownika do grupy');
      }
    } catch (error) {
      console.error('Błąd podczas dodawania pracownika do grupy:', error);
      alert('Nie udało się dodać pracownika do grupy');
    }
  };
  // Funkcja do generowania danych wykresu z uwzględnieniem interwału czasowego

  // Funkcja do generowania danych wykresu z uwzględnieniem interwału czasowego
  const generateChartData = (integratorEntries, parameter) => {
    let filteredEntries = [];
    switch (timeInterval) {
      case 'dzien':
        filteredEntries = integratorEntries.slice(-1);
        break;
      case 'tydzien':
        filteredEntries = integratorEntries.slice(-7);
        break;
      case 'miesiac':
        filteredEntries = integratorEntries.slice(-30);
        break;
      default:
        filteredEntries = integratorEntries;
        break;
    }

    // Generowanie losowego koloru
    const randomColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)})`;

    return {
      labels: filteredEntries.map((entry) =>
        moment(entry.utcDateTime).format('DD-MM-YYYY')
      ),
      datasets: [
        {
          label: `${parameter.toUpperCase()} over Time`,
          data: filteredEntries.map((entry) => entry[parameter]),
          borderColor: randomColor,
          tension: 0.1,
        },
      ],
    };
  };

  // Renderowanie tabeli z danymi statystyk
  const renderStatsTable = (device) => {
    let filteredEntries = [];
    switch (timeInterval) {
      case 'dzien':
        filteredEntries = device.IntegratorEntries.slice(-1);
        break;
      case 'tydzien':
        filteredEntries = device.IntegratorEntries.slice(-7);
        break;
      case 'miesiac':
        filteredEntries = device.IntegratorEntries.slice(-30);
        break;
      default:
        filteredEntries = device.IntegratorEntries;
        break;
    }

    return filteredEntries.map((entry, i) => (
      <tr key={i}>
        <td>{entry.total}</td>
        <td>{entry.rate}</td>
        <td>{entry.speed}</td>
        <td>{moment.utc(entry.utcDateTime).format('DD-MM-YYYY')}</td>
      </tr>
    ));
  };
  // Funkcja do zmiany prędkości (speed)
  const handleChangeSpeed = (devicePK) => {
    const newSpeed = prompt('Podaj nową wartość prędkości (speed):');
    if (newSpeed && !isNaN(newSpeed)) {
      // Tutaj logika do wysłania zmienionej wartości prędkości do serwera/API
      console.log(`Zmieniona prędkość dla urządzenia ${devicePK}: ${newSpeed}`);
      // Możesz dodać logikę aktualizacji stanu urządzenia tutaj
    }
  };
  const handleManageIntegrators = () => {
    navigate('/CursherInformation'); // Adjust the path as per your routes
  };
  // Funkcja do przełączania widoczności statystyk
  const toggleStats = (devicePK) => {
    const updatedDevices = devices.map((device) => {
      if (device.PK === devicePK) {
        return { ...device, showStats: !device.showStats };
      }
      return device;
    });
    setDevices(updatedDevices);
  };
  const loadAndShowGroups = async () => {
    const processedGroups = integratorGroups.map((group) => {
      const integratorsInGroup = devices.filter(
        (device) => device.integratorGroup === group.PK
      );
      const workersInGroup = workers.filter((worker) =>
        worker.integratorGroups.includes(group.PK)
      );

      return {
        ...group,
        integrators: integratorsInGroup,
        workers: workersInGroup,
      };
    });

    setGroupDetails(processedGroups);
    setShowGroupDetails(true);
  };

  useEffect(() => {
    const fetchUserDataAndDevices = async () => {
      if (userID) {
        await fetchIntegratorGroups();
        await fetchWorkers();
      }

      const userLogin = localStorage.getItem('userLogin');
      if (userLogin) {
        try {
          const userResponse = await axios.get(API_ENDPOINTS.getUserEndpoint, {
            headers: { From: userLogin, 'Content-Type': 'application/json' },
          });
          const userData = userResponse.data.user;
          setUserID(userData.PK);
          setIsManager(userData.role.isManager);
          setIsService(userData.role.isService);

          const devicesResponse = await axios.get(
            `${API_ENDPOINTS.getIntegrator}?login=${userLogin}`,
            {
              headers: { From: userLogin, 'Content-Type': 'application/json' },
            }
          );
          setDevices(
            devicesResponse.data.integrators.map((device) => ({
              ...device,
              showStats: false,
            }))
          );
        } catch (error) {
          console.error(
            'Błąd przy pobieraniu danych użytkownika lub urządzeń',
            error
          );
        }
      }
    };

    fetchUserDataAndDevices();
  }, [userID]);

  const handleLogout = () => {
    localStorage.removeItem('userLogin');
    navigate('/');
  };
  const toggleGroupDetails = async () => {
    if (showGroupDetails) {
      setShowGroupDetails(false);
    } else {
      await fetchWorkers();
      loadAndShowGroups();
    }
  };
  const handleRegisterDevice = async () => {
    if (!userID) {
      console.error('UserID jest nieustawione.');
      return;
    }

    try {
      const response = await axios.post(
        API_ENDPOINTS.integratorEndpoint,
        JSON.stringify({
          location: location,
          serialNumber: serialNumber,
          userID: userID, // Użyj zapisanego userID (PK)
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const newDevice = response.data;
        setDevices([...devices, newDevice]);
      }
    } catch (error) {
      console.error('Błąd podczas rejestracji urządzenia:', error);
    }
  };
  return (
    <div className='device-list-container'>
      {/* Renderuj przyciski tylko dla menedżerów i serwisantów */}
      {(isManager || isService) && (
        <div className='control-buttons'>
          <button onClick={() => setShowRegisterForm(!showRegisterForm)}>
            Zarejestruj urządzenie
          </button>
          <button onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}>
            Stwórz grupę
          </button>
          <button
            onClick={() =>
              setShowAddToIntegratorGroupForm(!showAddToIntegratorGroupForm)
            }
          >
            Dodaj integratora do grupy
          </button>
          <button
            onClick={() => {
              setShowAddWorkerToGroupForm(!showAddWorkerToGroupForm);
              fetchWorkers();
            }}
          >
            Dodaj pracownika do grupy
          </button>
          <button onClick={toggleGroupDetails} className='group-details-button'>
            Wyświetl grupy
          </button>
        </div>
      )}
      {/* Lista dostępnych urządzeń, widoczna dla wszystkich użytkowników */}
      <h2 className='title'>LISTA DOSTĘPNYCH URZĄDZEŃ</h2>

      <div className='user-info'>
        {localStorage.getItem('userLogin') && (
          <>
            <span>Zalogowany jako: {localStorage.getItem('userLogin')}</span>
            <button onClick={handleLogout}>Wyloguj</button>
          </>
        )}
      </div>
      {showAddToIntegratorGroupForm && (
        <div className='add-to-group-form'>
          {/* Dropdown for selecting an integrator (device) */}
          <select
            value={selectedIntegratorID}
            onChange={(e) => setSelectedIntegratorID(e.target.value)}
          >
            <option value=''>Wybierz integratora</option>
            {devices.map((device, index) => (
              <option key={index} value={device.PK}>
                {device.serialNumber} {/* Displaying serial number */}
              </option>
            ))}
          </select>

          {/* Dropdown for selecting a group */}
          <select
            value={selectedGroupID}
            onChange={(e) => setSelectedGroupID(e.target.value)}
          >
            <option value=''>Wybierz grupę</option>
            {integratorGroups.map((group, index) => (
              <option key={index} value={group.PK}>
                {group.integratorGroupName} {/* Use integratorGroupName here */}
              </option>
            ))}
          </select>

          <button onClick={handleAddToIntegratorGroup}>Dodaj do grupy</button>
        </div>
      )}
      {showAddWorkerToGroupForm && (
        <div className='add-to-group-form'>
          {/* Dropdown for selecting a worker */}
          <select
            value={selectedWorkerID}
            onChange={(e) => setSelectedWorkerID(e.target.value)}
          >
            <option value=''>Wybierz pracownika</option>
            {workers.map((worker, index) => (
              <option key={index} value={worker.PK}>
                {worker.name} {/* Assuming each worker has a 'name' property */}
              </option>
            ))}
          </select>

          {/* Dropdown for selecting a group */}
          <select
            value={selectedGroupID}
            onChange={(e) => setSelectedGroupID(e.target.value)}
          >
            <option value=''>Wybierz grupę</option>
            {integratorGroups.map((group, index) => (
              <option key={index} value={group.PK}>
                {group.integratorGroupName}{' '}
                {/* Assuming each group has an 'integratorGroupName' property */}
              </option>
            ))}
          </select>

          {/* Button to add worker to the selected group (You will need to implement the logic for this) */}
          <button onClick={handleAddWorkerToGroup}>
            Dodaj pracownika do grupy
          </button>
        </div>
      )}

      {showRegisterForm && (
        <div className='register-form'>
          <input
            type='text'
            placeholder='Lokalizacja'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type='text'
            placeholder='Numer seryjny'
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          <button onClick={handleRegisterDevice} className='register-button'>
            Zarejestruj
          </button>
        </div>
      )}

      {showCreateGroupForm && (
        <div className='create-group-form'>
          <input
            type='text'
            placeholder='Nazwa grupy integratorów'
            value={integratorGroupName}
            onChange={(e) => setIntegratorGroupName(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Utwórz grupę</button>
        </div>
      )}
      {showGroupDetails && (
        <div className='group-details'>
          {groupDetails.map((group, index) => (
            <div
              key={index}
              className='group-detail-item
'
            >
              <h3 className='group-name'>{group.integratorGroupName}</h3>
              <div className='group-section'>
                <strong>Integratory:</strong>
                <ul className='integrator-list'>
                  {group.integrators.map((integrator, idx) => (
                    <li key={idx} className='integrator-item'>
                      {integrator.serialNumber} - {integrator.location}
                    </li>
                  ))}
                </ul>
              </div>
              <div className='group-section'>
                <strong>Pracownicy:</strong>
                <ul className='worker-list'>
                  {group.workers.map((worker, idx) => (
                    <li key={idx} className='worker-item'>
                      {worker.name} {worker.surname}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <table className='device-table'>
        <thead>
          <tr>
            <th>SERIAL NUMBER</th>
            <th>LOCATION</th>
            <th></th> {/* Pusta kolumna dla przycisków "Więcej" */}
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>{device.serialNumber}</td>
                <td>{device.location}</td>
                <td>
                  <Link to={`/crusher/${device.PK}`} className='more-button'>
                    Więcej
                  </Link>
                  <button onClick={() => toggleStats(device.PK)}>Stats</button>
                </td>
              </tr>
              {device.showStats && (
                <tr>
                  <td colSpan='3'>
                    <div className='stats-options'>
                      <div className='interval-selector'>
                        <label htmlFor='interval-select'>
                          Zmień interwał czasowy:{' '}
                        </label>
                        <select
                          id='interval-select'
                          value={timeInterval}
                          onChange={(e) => setTimeInterval(e.target.value)}
                        >
                          <option value='dzien'>dzień</option>
                          <option value='tydzien'>tydzień</option>
                          <option value='miesiac'>miesiąc</option>
                        </select>
                      </div>
                      <div className='speed-change-button'>
                        <button onClick={() => handleChangeSpeed(device.PK)}>
                          Zmień Prędkość
                        </button>
                      </div>
                    </div>
                    <h4>Statystyki:</h4>
                    <table className='stats-table'>
                      <thead>
                        <tr>
                          <th>Total</th>
                          <th>Rate</th>
                          <th>Speed</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>{renderStatsTable(device)}</tbody>
                    </table>
                    <div>
                      <h4>Wykresy czasowe:</h4>
                      <Line
                        data={generateChartData(
                          device.IntegratorEntries,
                          'total'
                        )}
                      />
                      <Line
                        data={generateChartData(
                          device.IntegratorEntries,
                          'rate'
                        )}
                      />
                      <Line
                        data={generateChartData(
                          device.IntegratorEntries,
                          'speed'
                        )}
                      />
                    </div>
                    <button onClick={() => handleChangeSpeed(device.PK)}>
                      Zmień Speed
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeviceList;
