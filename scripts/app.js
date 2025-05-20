const listProductHTML = document.querySelector(".listProduct")
const listCartHTML = document.querySelector(".listCart")
const iconCart = document.querySelector(".icon-cart")
const iconCartSpan = document.querySelector(".icon-cart span")
const body = document.querySelector("body")
const closeCart = document.querySelector(".close")
let products = []
let cart = []

// Event listeners
iconCart.addEventListener("click", () => {
  body.classList.toggle("showCart")
})

closeCart.addEventListener("click", () => {
  body.classList.toggle("showCart")
})

// Add products to HTML
const addDataToHTML = () => {
  // Clear existing products
  listProductHTML.innerHTML = ""

  // Add new products
  if (products.length > 0) {
    products.forEach((product) => {
      const newProduct = document.createElement("div")
      newProduct.dataset.id = product.id
      newProduct.classList.add("item")
      newProduct.innerHTML = `<img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
            <h2>${product.name}</h2>
            <div class="price">$${product.price}</div>
            <button class="addCart">Add To Cart</button>`
      listProductHTML.appendChild(newProduct)
    })
  }
}

// Event listener for Add to Cart buttons
listProductHTML.addEventListener("click", (event) => {
  const positionClick = event.target
  if (positionClick.classList.contains("addCart")) {
    const product_id = positionClick.parentElement.dataset.id
    addToCart(product_id)
  }
})

// Add product to cart
const addToCart = (product_id) => {
  const positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id)
  if (cart.length <= 0) {
    cart = [
      {
        product_id: product_id,
        quantity: 1,
      },
    ]
  } else if (positionThisProductInCart < 0) {
    cart.push({
      product_id: product_id,
      quantity: 1,
    })
  } else {
    cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1
  }
  addCartToHTML()
  addCartToMemory()
}

// Save cart to localStorage
const addCartToMemory = () => {
  localStorage.setItem("cart", JSON.stringify(cart))
}

// Update cart HTML
const addCartToHTML = () => {
  listCartHTML.innerHTML = ""
  let totalQuantity = 0

  if (cart.length > 0) {
    cart.forEach((item) => {
      totalQuantity = totalQuantity + item.quantity
      const newItem = document.createElement("div")
      newItem.classList.add("item")
      newItem.dataset.id = item.product_id

      const positionProduct = products.findIndex((value) => value.id == item.product_id)
      if (positionProduct !== -1) {
        const info = products[positionProduct]
        newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}" alt="${info.name}" onerror="this.src='placeholder.jpg'">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus">&lt;</span>
                    <span>${item.quantity}</span>
                    <span class="plus">&gt;</span>
                </div>
                `
        listCartHTML.appendChild(newItem)
      }
    })
  }
  iconCartSpan.innerText = totalQuantity
}

// Event listener for cart quantity changes
listCartHTML.addEventListener("click", (event) => {
  const positionClick = event.target
  if (positionClick.classList.contains("minus") || positionClick.classList.contains("plus")) {
    const product_id = positionClick.parentElement.parentElement.dataset.id
    let type = "minus"
    if (positionClick.classList.contains("plus")) {
      type = "plus"
    }
    changeQuantityCart(product_id, type)
  }
})

// Change quantity of items in cart
const changeQuantityCart = (product_id, type) => {
  const positionItemInCart = cart.findIndex((value) => value.product_id == product_id)
  if (positionItemInCart >= 0) {
    switch (type) {
      case "plus":
        cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1
        break

      default:
        const changeQuantity = cart[positionItemInCart].quantity - 1
        if (changeQuantity > 0) {
          cart[positionItemInCart].quantity = changeQuantity
        } else {
          cart.splice(positionItemInCart, 1)
        }
        break
    }
  }
  addCartToHTML()
  addCartToMemory()
}

// Initialize the app
const initApp = () => {
  // Get products data
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      products = data
      addDataToHTML()

      // Get cart from localStorage
      if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"))
        addCartToHTML()
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error)
      // Display error message to user
      listProductHTML.innerHTML = "<p>Error loading products. Please try again later.</p>"
    })
}

// Create a placeholder image
const createPlaceholder = () => {
  const placeholder = document.createElement("img")
  placeholder.src = "placeholder.jpg"
  document.body.appendChild(placeholder)
  placeholder.style.display = "none"
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  createPlaceholder()
  initApp()

  // Weather Forecast Functionality
  const API_KEY = "4764e36cac2b0d43ab02c8560871a486"
  const locationInput = document.getElementById("location-input")
  const searchBtn = document.getElementById("search-btn")
  const currentLocationBtn = document.getElementById("current-location-btn")
  const locationElement = document.getElementById("location")
  const temperatureElement = document.getElementById("temperature")
  const weatherDescriptionElement = document.getElementById("weather-description")
  const weatherIconElement = document.getElementById("weather-icon-img")
  const humidityElement = document.getElementById("humidity")
  const windSpeedElement = document.getElementById("wind-speed")
  const feelsLikeElement = document.getElementById("feels-like")
  const forecastContainer = document.getElementById("forecast")

  // Get weather by city name
  const getWeatherByCity = (city) => {
    locationElement.textContent = "Loading..."

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("City not found")
        }
        return response.json()
      })
      .then((data) => {
        displayCurrentWeather(data)

        // Get coordinates for forecast
        const { lat, lon } = data.coord
        getForecast(lat, lon)
      })
      .catch((error) => {
        locationElement.textContent = error.message
        console.error("Error fetching weather:", error)
      })
  }

  // Get weather by coordinates
  const getWeatherByCoords = (lat, lon) => {
    locationElement.textContent = "Loading..."

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then((response) => response.json())
      .then((data) => {
        displayCurrentWeather(data)
        getForecast(lat, lon)
      })
      .catch((error) => {
        locationElement.textContent = "Error loading weather"
        console.error("Error fetching weather:", error)
      })
  }

  // Get 5-day forecast
  const getForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then((response) => response.json())
      .then((data) => {
        displayForecast(data)
      })
      .catch((error) => {
        console.error("Error fetching forecast:", error)
      })
  }

  // Display current weather
  const displayCurrentWeather = (data) => {
    const { name } = data
    const { temp, feels_like, humidity } = data.main
    const { description, icon } = data.weather[0]
    const { speed } = data.wind

    locationElement.textContent = name
    temperatureElement.textContent = Math.round(temp)
    weatherDescriptionElement.textContent = description
    weatherIconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`
    weatherIconElement.alt = description
    humidityElement.textContent = `${humidity}%`
    windSpeedElement.textContent = `${speed} m/s`
    feelsLikeElement.textContent = `${Math.round(feels_like)}°C`
  }

  // Display 5-day forecast
  const displayForecast = (data) => {
    forecastContainer.innerHTML = ""

    // Get one forecast per day (noon)
    const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00"))

    dailyData.forEach((day) => {
      const date = new Date(day.dt * 1000)
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const { temp_min, temp_max } = day.main
      const { icon, description } = day.weather[0]

      const forecastItem = document.createElement("div")
      forecastItem.classList.add("forecast-item")
      forecastItem.innerHTML = `
      <div class="day">${dayName}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
      <div class="temp">${Math.round(temp_max)}°C</div>
      <div class="temp-min">${Math.round(temp_min)}°C</div>
    `

      forecastContainer.appendChild(forecastItem)
    })
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      locationElement.textContent = "Getting location..."

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          getWeatherByCoords(latitude, longitude)
        },
        (error) => {
          locationElement.textContent = "Location access denied"
          console.error("Geolocation error:", error)
          // Default to a city if location access is denied
          getWeatherByCity("New York")
        },
      )
    } else {
      locationElement.textContent = "Geolocation not supported"
      // Default to a city if geolocation is not supported
      getWeatherByCity("New York")
    }
  }

  // Event listeners for weather functionality
  searchBtn.addEventListener("click", () => {
    const city = locationInput.value.trim()
    if (city) {
      getWeatherByCity(city)
    }
  })

  locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = locationInput.value.trim()
      if (city) {
        getWeatherByCity(city)
      }
    }
  })

  currentLocationBtn.addEventListener("click", getCurrentLocation)

  // Initialize weather with default city or user's location
  getCurrentLocation()

  // Weather widget toggle functionality
  const weatherWidget = document.querySelector(".weather-widget")
  const toggleWeatherBtn = document.getElementById("toggle-weather")

  toggleWeatherBtn.addEventListener("click", () => {
    weatherWidget.classList.toggle("active")
  })

  // Initialize weather widget as closed
  weatherWidget.classList.remove("active")
})
