import React, { Component } from 'react';

class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    alert(`Login: ${this.state.username}, Hasło: ${this.state.password}`);
    // Tutaj można dodać logikę logowania
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Nazwa użytkownika:
          <input
            type='text'
            name='username'
            value={this.state.username}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <label>
          Hasło:
          <input
            type='password'
            name='password'
            value={this.state.password}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <button type='submit'>Zaloguj się</button>
      </form>
    );
  }
}

export default ClassComponent;
