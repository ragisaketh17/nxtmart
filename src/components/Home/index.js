import {Component} from 'react'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'

const nxtMartApiUrl = 'https://apis2.ccbp.in/nxt-mart/category-list-details'

const DEFAULT_PRODUCT_STOCK = 20
const LOW_STOCK_LIMIT = 10

class Home extends Component {
  state = {
    categories: [],
    activeCategory: '',
    isLoading: true,
    isFailure: false,
    cartData: JSON.parse(localStorage.getItem('cartData')) || [],
    productStock: JSON.parse(localStorage.getItem('productStock')) || {},
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

      const response = await fetch(nxtMartApiUrl, {
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
        activeCategory:
          data.categories.length > 0 ? data.categories[0].name : '',
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

  getCount = id => {
    const {cartData} = this.state

    const item = cartData.find(cartItem => cartItem.id === id)

    return item ? item.count : 0
  }

  getRemainingStock = productId => {
    const {productStock} = this.state

    return productStock[productId] ?? DEFAULT_PRODUCT_STOCK
  }

  addProduct = product => {
    const {cartData, productStock} = this.state

    const remainingStock = this.getRemainingStock(product.id)

    if (remainingStock <= 0) {
      return
    }

    const existingItem = cartData.find(item => item.id === product.id)

    let updatedCartData

    if (existingItem) {
      updatedCartData = cartData.map(item => {
        if (item.id === product.id) {
          return {
            ...item,
            count: item.count + 1,
          }
        }

        return item
      })
    } else {
      updatedCartData = [
        ...cartData,
        {
          ...product,
          count: 1,
        },
      ]
    }
    this.setState({
      cartData: updatedCartData,
      productStock,
    })

    localStorage.setItem('cartData', JSON.stringify(updatedCartData))
  }

  decrementProduct = product => {
    const {cartData} = this.state

    const updatedCartData = cartData
      .map(item => {
        if (item.id === product.id) {
          return {
            ...item,
            count: item.count - 1,
          }
        }

        return item
      })
      .filter(item => item.count > 0)

    this.setState({
      cartData: updatedCartData,
    })

    localStorage.setItem('cartData', JSON.stringify(updatedCartData))
  }

  renderProduct = product => {
    const count = this.getCount(product.id)
    const remainingStock = this.getRemainingStock(product.id)

    const availableToAdd = remainingStock - count

    return (
      <li key={product.id} className="product-item" data-testid="product">
        <img className="product-image" src={product.image} alt={product.name} />

        <p className="product-name">{product.name}</p>

        <p className="product-weight">{product.weight}</p>

        <p className="product-price">{product.price}</p>

        {availableToAdd <= LOW_STOCK_LIMIT && availableToAdd > 0 && (
          <p className="low-stock-warning">⚠️ Only {availableToAdd} left</p>
        )}

        {availableToAdd === 0 && (
          <p className="out-of-stock-warning">❌ Out of stock</p>
        )}

        {count === 0 ? (
          <button
            type="button"
            className="add-button"
            data-testid="add-button"
            onClick={() => this.addProduct(product)}
            disabled={remainingStock === 0}
          >
            {remainingStock === 0 ? 'Out of stock' : 'Add'}
          </button>
        ) : (
          <div className="quantity-container">
            <button
              type="button"
              className="quantity-button"
              data-testid="decrement-count"
              onClick={() => this.decrementProduct(product)}
            >
              -
            </button>

            <span className="quantity" data-testid="active-count">
              {count}
            </span>

            <button
              type="button"
              className="quantity-button"
              data-testid="increment-count"
              onClick={() => this.addProduct(product)}
              disabled={availableToAdd === 0}
            >
              +
            </button>
          </div>
        )}
      </li>
    )
  }

  renderFailureView = () => (
    <div className="failure-container">
      <img
        src="https://new-assets.ccbp.in/frontend/react-js/nxt-mart-app/failure-view.png"
        alt="failure view"
      />

      <h1>Oops! Something Went Wrong</h1>

      <p>We are having some trouble</p>

      <button type="button" className="retry-button" onClick={this.getProducts}>
        Retry
      </button>
    </div>
  )

  render() {
    const {categories, activeCategory, isLoading, isFailure} = this.state

    if (isLoading) {
      return (
        <div className="home-container">
          <Header />

          <div className="loader-container" data-testid="loader">
            <p>Loading...</p>
          </div>
        </div>
      )
    }

    if (isFailure) {
      return (
        <div className="home-container">
          <Header />

          {this.renderFailureView()}
        </div>
      )
    }

    return (
      <div className="home-container">
        <Header />

        <div className="home-content">
          <aside className="categories-container">
            <h2>Categories</h2>

            <ul className="categories-list">
              {categories.map(category => (
                <li key={category.name}>
                  <button
                    type="button"
                    className={`category-button ${
                      activeCategory === category.name ? 'active-category' : ''
                    }`}
                    onClick={() =>
                      this.setState({
                        activeCategory: category.name,
                      })
                    }
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="products-container">
            {categories.map(category => {
              if (category.name !== activeCategory) {
                return null
              }

              return (
                <section key={category.name}>
                  <h1 className="category-title">{category.name}</h1>

                  <ul className="products-list">
                    {category.products.map(product =>
                      this.renderProduct(product),
                    )}
                  </ul>
                </section>
              )
            })}
          </main>
        </div>
      </div>
    )
  }
}

export default Home
