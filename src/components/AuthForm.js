import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import axios from 'axios';

function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const request = {
      url: 'https://jfhnwg5jfl.execute-api.eu-central-1.amazonaws.com/prod/login',
      method: 'POST',
      data: JSON.stringify({ login: login, password: password }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios(request);
      console.log(response.data);
      localStorage.setItem('userLogin', login);
      navigate('/DeviceList'); // Przekierowanie po pomyślnym logowaniu
    } catch (error) {
      console.error('Wystąpił błąd podczas logowania:', error);
      alert('Nieprawidłowy login lub hasło!');
      // Dodatkowa obsługa błędów
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Hasła nie są identyczne!');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.registerEndpoint, {
        login: login,
        password: password,
        name: name,
        surname: surname,
      });

      if (response.status === 200) {
        // Zapisanie loginu użytkownika do localStorage
        localStorage.setItem('userLogin', login);

        // Automatyczne logowanie po pomyślnej rejestracji
        handleLogin(new Event('login'));
      }
    } catch (error) {
      console.error('Wystąpił błąd podczas rejestracji:', error);
    }
  };

  return (
    <div className='auth-form'>
      <h2>{isRegistering ? 'Rejestracja' : 'Logowanie'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input
          type='text'
          placeholder='Login'
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          type='password'
          placeholder='Hasło'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegistering && (
          <>
            <input
              type='password'
              placeholder='Powtórz hasło'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input
              type='text'
              placeholder='Imię'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type='text'
              placeholder='Nazwisko'
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </>
        )}
        <button type='submit'>
          {isRegistering ? 'Zarejestruj się' : 'Zaloguj'}
        </button>
      </form>
      {isRegistering ? (
        <p>
          Masz już konto?{' '}
          <button onClick={() => setIsRegistering(false)}>Zaloguj się</button>
        </p>
      ) : (
        <p>
          Nie masz konta?{' '}
          <button onClick={() => setIsRegistering(true)}>
            Zarejestruj się
          </button>
        </p>
      )}
    </div>
  );
}

export default AuthForm;
