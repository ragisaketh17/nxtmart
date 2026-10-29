import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'

import './index.css'

class Login extends Component {
  state = {
    username: '',
    password: '',
    showPassword: false,
    errorMsg: '',
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onTogglePassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword,
    }))
  }

  onSubmitLogin = async event => {
    event.preventDefault()

    const {username, password} = this.state

    const options = {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    }

    try {
      const response = await fetch('https://apis.ccbp.in/login', options)
      const data = await response.json()

      if (data.jwt_token) {
        Cookies.set('jwt_token', data.jwt_token, {
          expires: 30,
        })

        this.setState({
          errorMsg: '',
        })
      } else {
        this.setState({
          errorMsg: data.error_msg,
        })
      }
    } catch (error) {
      this.setState({
        errorMsg: 'Something went wrong',
      })
    }
  }

  render() {
    const {username, password, showPassword, errorMsg} = this.state

    if (Cookies.get('jwt_token') !== undefined) {
      return <Redirect to="/" />
    }

    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo-container">
            <img
              className="login-logo"
              src="https://assets.ccbp.in/frontend/react-js/nxt-mart-logo.png"
              alt="login website logo"
            />
          </div>

          <h1 className="login-title">Welcome to Nxt Mart</h1>

          <p className="login-subtitle">Login to continue shopping</p>

          <form className="login-form" onSubmit={this.onSubmitLogin}>
            <div className="input-container">
              <label htmlFor="username">USERNAME</label>

              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={this.onChangeUsername}
              />
            </div>

            <div className="input-container">
              <label htmlFor="password">PASSWORD</label>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={this.onChangePassword}
              />
            </div>

            <div className="show-password-container">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={this.onTogglePassword}
              />

              <label htmlFor="showPassword">Show Password</label>
            </div>

            {errorMsg !== '' && <p className="error-message">{errorMsg}</p>}

            <button className="login-button" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default Login
