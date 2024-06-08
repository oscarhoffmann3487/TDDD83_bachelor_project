var cartContent = getShoppingCart();


//Create the a checkout session for the items in the cart
var createCheckoutSession = function () {
  const headers = new Headers();
  const jwtToken = JSON.parse(sessionStorage.getItem('auth')).token;
  headers.append('Authorization', 'Bearer ' + jwtToken);
  headers.append('Content-Type', 'application/json');


  let backendCart = correctCart(cartContent);
  let adressForm = document.getElementById('checkout-form');
  let adress = {
    "name": adressForm.elements['name'].value,
    "phone number": adressForm.elements['phone'].value,
    "street": adressForm.elements['street'].value,
    "zip code": adressForm.elements['zip'].value,
    "country": adressForm.elements['country'].value
  };
  let order = {
    "cart": backendCart,
    "address": adress
  };

  if (!adress["name"]){
    alert("Please enter a name!");
  }else if (!adress["phone number"]){
    alert("Please enter a correct phone number!");
  }else if (!adress["street"]){
    alert("Please enter a correct street!");
  }else if (!adress["zip code"]){
    alert("Please enter a correct zip code!");
  }else if (!adress["country"]){
    alert("Please enter a correct country!");
  } else {
    const url = '/create-checkout-session';
    const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(order)
  };


  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create checkout session.');
      }
    })
    .then(data => {
      window.location.replace(data);
    })
    .catch(error => {
      console.log("error");
    });
  }

  /* såhär bör inputen ut för att den ska vara giltig
  {
      "cart": [{
        "image": "image_id",
        "frame": "white",
        "size": "60x60",
        "glossy": true,
        "margin": "10%",
        "quantity": 1,
      },
      {
        "image": "image_id",
        "frame": false,
        "size": "60x60",
        "glossy": false,
        "margin": "false",
        "quantity": 1,
      }

      ],
      "address": {
        "street": "Street_name",
        "postcode": "postcode",
        "city": "City",
        "country": "Country"
      }
    }
  */
}

//updates the content of the checkout cart
var updateCheckoutContent = function () {

  var checkoutBox = document.getElementById('order-information-container');
  var totalPrice = 0;

  cartContent.forEach(item => {

    var checkoutItem = document.createElement("div");
    checkoutItem.classList.add("checkout-info");

    var image = document.createElement("img");
    image.classList.add("product-img");
    image.src = item.image;

    var info = document.createElement("div");
    var size = document.createElement("small");
    size.textContent = item.size;
    var frame = document.createElement("small");
    frame.textContent = item.frame;
    var margin = document.createElement("small");
    margin.textContent = item.margin;
    var paper = document.createElement("small");
    paper.textContent = item.paper;
    info.appendChild(size);
    info.appendChild(document.createElement("br"));
    info.appendChild(frame);
    info.appendChild(document.createElement("br"));
    info.appendChild(margin);
    info.appendChild(document.createElement("br"));
    info.appendChild(paper);

    var quantity = document.createElement("input");
    quantity.type = "number";
    quantity.value = item.quantity;
    quantity.classList.add("order-quantity");
    quantity.dataset.price = item.price;
    quantity.min = "1";

    var trashcan = document.createElement("img");
    trashcan.classList.add("order-trashcan-img");
    trashcan.src = "../static/exampleimages/Trash.png";

    var price = document.createElement("div");
    price.classList.add("poster-price");
    price.textContent = item.price + " SEK";

    checkoutItem.appendChild(image);
    checkoutItem.appendChild(info);
    checkoutItem.appendChild(quantity);
    checkoutItem.appendChild(price);
    checkoutItem.appendChild(trashcan);

    checkoutBox.appendChild(checkoutItem);

    totalPrice += item.price * item.quantity;

  });

  var total = document.getElementById("tot-price-text");
  total.textContent = totalPrice + " SEK";

  // Event listener for changing the qunatat
  $(".order-quantity").off('input').on('change', function () {

    const quantity = $(this).val();
    const index = $(this).closest('.checkout-info').index() - 1;
    updateCartQuantity(index, quantity);
  })

  // Event listener for clicking on the basket
  $(".order-trashcan-img").on("click", function () {

    const index = $(this).closest('.checkout-info').index() - 1;
    removeFromCart(index);
  })

}

//Clear the cart of items
var clearCheckoutItems = function () {

  const checkoutItems = document.querySelectorAll(".checkout-info");
  checkoutItems.forEach(function (checkoutInfoItem) {
    checkoutInfoItem.remove();
  });
}


$(document).ready(function () {

  var checkoutBox = document.getElementById('order-information-container');

  const orderInfoText = document.createElement("h4");
  orderInfoText.textContent = "Order Information";
  checkoutBox.appendChild(orderInfoText);

  updateCheckoutContent();

});

//create the right format for the cart
function correctCart(cart) {
  new_cart = []
  for (key in cart) {
    var item = cart[key];
    var new_item = {};
    new_item["size"] = item["size"].split(' ')[0];

    if (item["frame"] == "No frame") {
      new_item["frame"] = false;
    } else {
      new_item["frame"] = item["frame"].split(' ')[0].toLowerCase();
    }

    if (item["margin"] == "No margin") {
      new_item["margin"] = false;
    } else {
      new_item["margin"] = item["margin"].split(' ')[0];
    }

    if (item["paper"] == "Glossy paper") {
      new_item["glossy"] = true;
    } else {
      new_item["glossy"] = false;
    }

    new_item["image"] = item["imageid"];

    new_item["quantity"] = item["quantity"];

    new_cart.push(new_item);
  }
  return new_cart;
};

var resetURL= function(path){
  var currentPath = window.location.pathname;
  newPath = currentPath.replace(path, "");
  window.history.pushState(null, null, newPath);
}

//Set log to log in if not loged in
function switchToLogin() {
  var signedIn = sessionStorage.getItem('auth') != null;
  if (!signedIn) {
    setPage("loginpage");

  }
}
