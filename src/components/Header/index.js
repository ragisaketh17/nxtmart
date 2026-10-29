import {Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const Header = props => {
  const {history} = props

  const onClickLogout = () => {
    Cookies.remove('jwt_token')
    history.replace('/login')
  }

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <img
          src="https://assets.ccbp.in/frontend/react-js/nxt-mart-logo.png"
          alt="website logo"
          className="website-logo"
        />
      </Link>

      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/cart">Cart</Link>
          </li>

          <li>
            <button type="button" onClick={onClickLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default withRouter(Header)
