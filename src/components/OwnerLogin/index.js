import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import './index.css'

const OWNER_USERNAME = 'admin'
const OWNER_PASSWORD = 'nxtmart@123'

class OwnerLogin extends Component {
  state = {
    username: '',
    password: '',
    errorMessage: '',
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitLogin = event => {
    event.preventDefault()

    const {username, password} = this.state
    const {history} = this.props

    if (username.trim() === OWNER_USERNAME && password === OWNER_PASSWORD) {
      sessionStorage.setItem('owner_logged_in', 'true')
      history.push('/dashboard')
    } else {
      this.setState({
        errorMessage: 'Invalid owner username or password',
      })
    }
  }

  render() {
    const isOwnerLoggedIn = sessionStorage.getItem('owner_logged_in') === 'true'

    if (isOwnerLoggedIn) {
      return <Redirect to="/dashboard/inventory" />
    }

    const {username, password, errorMessage} = this.state

    return (
      <div className="owner-login-page">
        <div className="owner-login-card">
          <p className="owner-login-label">NXT MART</p>

          <h1>Owner Login</h1>

          <p className="owner-login-subtitle">
            Sign in to manage your inventory
          </p>

          <form onSubmit={this.onSubmitLogin}>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={this.onChangeUsername}
              placeholder="Enter username"
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={this.onChangePassword}
              placeholder="Enter password"
            />

            {errorMessage && (
              <p className="owner-login-error">{errorMessage}</p>
            )}

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    )
  }
}

export default OwnerLogin
