import {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const DEFAULT_PRODUCT_STOCK = 20

class Cart extends Component {
  state = {
    cartData: [],
    isOrderPlaced: false,
  }

  componentDidMount() {
    const storedCart = localStorage.getItem('cartData')

    if (storedCart) {
      this.setState({
        cartData: JSON.parse(storedCart),
      })
    }
  }

  updateCart = updatedCart => {
    this.setState({cartData: updatedCart})
    localStorage.setItem('cartData', JSON.stringify(updatedCart))
  }

  decreaseQuantity = id => {
    const {cartData} = this.state

    const updatedCart = cartData
      .map(item => {
        if (item.id === id) {
          return {...item, count: item.count - 1}
        }

        return item
      })
      .filter(item => item.count > 0)

    this.updateCart(updatedCart)
  }

  increaseQuantity = id => {
    const {cartData} = this.state

    const productStock = JSON.parse(localStorage.getItem('productStock')) || {}

    const item = cartData.find(cartItem => cartItem.id === id)

    if (!item) {
      return
    }

    const remainingStock =
      productStock[id] !== undefined ? productStock[id] : DEFAULT_PRODUCT_STOCK

    if (item.count >= remainingStock) {
      return
    }

    const updatedCart = cartData.map(cartItem => {
      if (cartItem.id === id) {
        return {...cartItem, count: cartItem.count + 1}
      }

      return cartItem
    })

    this.updateCart(updatedCart)
  }

  getPrice = price => Number(price.replace(/[^\d.]/g, ''))

  getTotalPrice = () => {
    const {cartData} = this.state

    return cartData.reduce(
      (total, item) => total + this.getPrice(item.price) * item.count,
      0,
    )
  }

  onClickCheckout = () => {
    const {cartData} = this.state

    const productStock = JSON.parse(localStorage.getItem('productStock')) || {}

    const updatedStock = {...productStock}
    cartData.forEach(item => {
      const currentStock =
        updatedStock[item.id] !== undefined
          ? updatedStock[item.id]
          : DEFAULT_PRODUCT_STOCK

      updatedStock[item.id] = Math.max(0, currentStock - item.count)
    })

    localStorage.setItem('productStock', JSON.stringify(updatedStock))

    localStorage.removeItem('cartData')

    this.setState({
      cartData: [],
      isOrderPlaced: true,
    })
  }

  goToHome = () => {
    const {history} = this.props
    history.push('/')
  }

  renderEmptyCart = () => (
    <div className="empty-cart">
      <img
        src="https://new-assets.ccbp.in/frontend/react-js/nxt-mart-app/empty-cart-img.png"
        alt="empty cart"
      />

      <h1>Your cart is empty</h1>

      <p>Add some products to your cart to continue shopping.</p>

      <button type="button" onClick={this.goToHome}>
        Return to Homepage
      </button>
    </div>
  )

  renderPaymentSuccess = () => (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <h1>Payment Successful</h1>

        <p>Thank you for ordering</p>

        <button type="button" onClick={this.goToHome}>
          Return to Homepage
        </button>
      </div>
    </div>
  )

  renderCartItems = () => {
    const {cartData} = this.state

    return (
      <ul className="cart-list">
        {cartData.map(item => (
          <li data-testid="cartItem" className="cart-item" key={item.id}>
            <img className="cart-item-image" src={item.image} alt={item.name} />

            <div className="cart-item-details">
              <h2>{item.name}</h2>

              <p className="cart-item-weight">{item.weight}</p>

              <p className="cart-item-price">{item.price}</p>

              <div className="quantity-container">
                <button
                  type="button"
                  data-testid="decrement-quantity"
                  onClick={() => this.decreaseQuantity(item.id)}
                >
                  -
                </button>

                <span data-testid="item-quantity">{item.count}</span>

                <button
                  type="button"
                  data-testid="increment-quantity"
                  onClick={() => this.increaseQuantity(item.id)}
                >
                  +
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  renderCart = () => {
    const {cartData} = this.state

    if (cartData.length === 0) {
      return this.renderEmptyCart()
    }

    return (
      <div className="cart-container">
        <div className="cart-content">
          <h1 className="cart-heading">My Cart</h1>

          {this.renderCartItems()}

          <div className="order-summary">
            <div>
              <h2>Order Total</h2>

              <p data-testid="total-price">
                Total ({cartData.length} items) : ₹{this.getTotalPrice()}
              </p>
            </div>

            <button type="button" onClick={this.onClickCheckout}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {isOrderPlaced} = this.state

    return (
      <div className="cart-page">
        <Header />

        {isOrderPlaced ? this.renderPaymentSuccess() : this.renderCart()}
      </div>
    )
  }
}

export default withRouter(Cart)
