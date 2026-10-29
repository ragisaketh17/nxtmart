import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'

const productsApiUrl = 'https://apis2.ccbp.in/nxt-mart/category-list-details'

const DEFAULT_PRODUCT_STOCK = 20

class Dashboard extends Component {
  state = {
    categories: [],
    productStock: {},
    isLoading: true,
    isFailure: false,
  }

  componentDidMount() {
    this.getProducts()
  }

  getProducts = async () => {
    this.setState({
      isLoading: true,
      isFailure: false,
    })

    try {
      const jwtToken = Cookies.get('jwt_token')

      const response = await fetch(productsApiUrl, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const savedStock = JSON.parse(localStorage.getItem('productStock')) || {}

      const updatedStock = {...savedStock}

      data.categories.forEach(category => {
        category.products.forEach(product => {
          if (updatedStock[product.id] === undefined) {
            updatedStock[product.id] = DEFAULT_PRODUCT_STOCK
          }
        })
      })

      localStorage.setItem('productStock', JSON.stringify(updatedStock))

      this.setState({
        categories: data.categories,
        productStock: updatedStock,
        isLoading: false,
      })
    } catch (error) {
      this.setState({
        isLoading: false,
        isFailure: true,
      })
    }
  }

  updateStock = (productId, change) => {
    const {productStock} = this.state

    const currentStock =
      productStock[productId] !== undefined
        ? productStock[productId]
        : DEFAULT_PRODUCT_STOCK

    const newStock = Math.max(0, currentStock + change)

    const updatedStock = {
      ...productStock,
      [productId]: newStock,
    }

    this.setState({
      productStock: updatedStock,
    })

    localStorage.setItem('productStock', JSON.stringify(updatedStock))
  }

  getAllProducts = () => {
    const {categories} = this.state

    return categories.reduce(
      (products, category) => [...products, ...category.products],
      [],
    )
  }

  getProductStock = productId => {
    const {productStock} = this.state

    return productStock[productId] !== undefined
      ? productStock[productId]
      : DEFAULT_PRODUCT_STOCK
  }

  getStockStatus = stock => {
    if (stock === 0) {
      return 'Out of stock'
    }

    if (stock <= 10) {
      return 'Low stock'
    }

    return 'In stock'
  }

  getStockStatusClass = stock => {
    if (stock === 0) {
      return 'out-of-stock'
    }

    if (stock <= 10) {
      return 'low-stock'
    }

    return 'in-stock'
  }

  onLogout = () => {
    const {history} = this.props

    sessionStorage.removeItem('owner_logged_in')

    history.push('/OwnerLogin')
  }

  renderDashboardHeader = () => (
    <div className="dashboard-header">
      <div>
        <p className="dashboard-label">OWNER PANEL</p>

        <h1>Nxt Mart Dashboard</h1>

        <p className="dashboard-description">
          Manage your products and inventory.
        </p>
      </div>

      <button
        type="button"
        className="dashboard-logout-button"
        onClick={this.onLogout}
      >
        Logout
      </button>
    </div>
  )

  renderDashboardStats = () => {
    const allProducts = this.getAllProducts()

    const totalProducts = allProducts.length

    const totalStock = allProducts.reduce(
      (total, product) => total + this.getProductStock(product.id),
      0,
    )

    const lowStockProducts = allProducts.filter(product => {
      const stock = this.getProductStock(product.id)

      return stock > 0 && stock <= 10
    }).length

    const outOfStockProducts = allProducts.filter(product => {
      const stock = this.getProductStock(product.id)

      return stock === 0
    }).length

    return (
      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div className="stat-card">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="stat-card">
          <span>Low Stock</span>
          <strong>{lowStockProducts}</strong>
        </div>

        <div className="stat-card">
          <span>Out of Stock</span>
          <strong>{outOfStockProducts}</strong>
        </div>
      </section>
    )
  }

  renderProduct = product => {
    const stock = this.getProductStock(product.id)

    const status = this.getStockStatus(stock)

    const statusClass = this.getStockStatusClass(stock)

    return (
      <tr key={product.id}>
        <td>
          <div className="dashboard-product">
            <img src={product.image} alt={product.name} />

            <div>
              <p className="dashboard-product-name">{product.name}</p>

              <p className="dashboard-product-weight">{product.weight}</p>
            </div>
          </div>
        </td>

        <td>{product.price}</td>

        <td>
          <div className="stock-controls">
            <button
              type="button"
              onClick={() => this.updateStock(product.id, -1)}
              disabled={stock === 0}
              aria-label={`Decrease ${product.name} stock`}
            >
              −
            </button>

            <span>{stock}</span>

            <button
              type="button"
              onClick={() => this.updateStock(product.id, 1)}
              aria-label={`Increase ${product.name} stock`}
            >
              +
            </button>
          </div>
        </td>

        <td>
          <span className={`stock-status ${statusClass}`}>{status}</span>
        </td>
      </tr>
    )
  }

  renderInventory = () => {
    const {categories} = this.state

    return (
      <section className="inventory-section">
        <div className="inventory-header">
          <div>
            <h2>Inventory</h2>

            <p>Update the available quantity of each product.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {categories.map(category =>
                category.products.map(product => this.renderProduct(product)),
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  renderLoadingView = () => (
    <div className="dashboard-loader">
      <div className="dashboard-spinner" />

      <p>Loading dashboard...</p>
    </div>
  )

  renderFailureView = () => (
    <div className="dashboard-error">
      <h2>Unable to load dashboard</h2>

      <p>We could not load the products right now.</p>

      <button type="button" onClick={this.getProducts}>
        Retry
      </button>
    </div>
  )

  render() {
    const {isLoading, isFailure} = this.state

    const isOwnerLoggedIn = sessionStorage.getItem('owner_logged_in') === 'true'

    if (!isOwnerLoggedIn) {
      return <Redirect to="/OwnerLogin" />
    }

    return (
      <div className="dashboard-container">
        <Header />

        {isLoading && this.renderLoadingView()}

        {isFailure && this.renderFailureView()}

        {!isLoading && !isFailure && (
          <main className="dashboard-page">
            {this.renderDashboardHeader()}

            {this.renderDashboardStats()}

            {this.renderInventory()}
          </main>
        )}
      </div>
    )
  }
}

export default Dashboard
