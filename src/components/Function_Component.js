import React, { useState } from 'react';

function FunctionComponent() {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Login: ${inputs.username}, Hasło: ${inputs.password}`);
    // Tutaj można dodać logikę logowania
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nazwa użytkownika:
        <input
          type='text'
          name='username'
          value={inputs.username}
          onChange={handleInputChange}
        />
      </label>
      <br />
      <label>
        Hasło:
        <input
          type='password'
          name='password'
          value={inputs.password}
          onChange={handleInputChange}
        />
      </label>
      <br />
      <button type='submit'>Zaloguj się</button>
    </form>
  );
}

export default FunctionComponent;
