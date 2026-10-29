import {BrowserRouter, Switch, Route} from 'react-router-dom'

import Home from './components/Home'
import Login from './components/Login'
import Cart from './components/Cart'
import OwnerLogin from './components/OwnerLogin'
import Dashboard from './components/Dashboard'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

const App = () => (
  <BrowserRouter>
    <Switch>
      {/* Customer Login */}
      <Route exact path="/login" component={Login} />

      {/* Owner Login */}
      <Route exact path="/OwnerLogin" component={OwnerLogin} />

      {/* Owner Dashboard */}
      <Route exact path="/dashboard" component={Dashboard} />

      {/* Customer Pages */}
      <ProtectedRoute exact path="/" component={Home} />

      <ProtectedRoute exact path="/cart" component={Cart} />

      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>
)

export default App
