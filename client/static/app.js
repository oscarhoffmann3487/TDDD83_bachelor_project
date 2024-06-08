//global varibles
var host = window.location.protocol + '//' + location.host;
var formType = "signin";
var signedIn = sessionStorage.getItem('auth') != null;
var itemPrice = {
    size: {
        '20x20': 0,
        '40x40': 0,
        '50x50': 0,
        '60x60': 0
    }, frame: {
        "20x20": 0,
        "40x40": 0,
        "50x50": 0,
        "60x60": 0
    }, glossy: {
        "20x20": 0,
        "40x40": 0,
        "50x50": 0,
        "60x60": 0
    },
}

let shoppingCart = [];
var currentFrame = null;
var currentSize = "40x40"; // Deafultstorleken
var currentPaper = "matte"; // Defaultpapper
var currentMargin = null;


//sets the html code(page) according tho the in parameter
var setPage = function (viewId) {
    signedIn = sessionStorage.getItem('auth') != null;

    profileImg = "<img src='../static/exampleimages/login iconlogin-icon-png-1.png' id='user-img'>";

    if (signedIn) {
        userName = JSON.parse(sessionStorage.getItem("auth")).name;
        $("#login-button").html(profileImg + userName);
    } else {
        $("#login-button").html(profileImg + "login");
    }
    $("#view-container").load("views/" + viewId + ".html");
    $(window).scrollTop(0);

};

$(".dropdwn").hover(
    function () {

        if (shoppingCart.length > 0) {

            $("#empty-cart-dropdown").hide();
            $("#cart-dropdown").show();

        } else {
            $("#empty-cart-dropdown").show();
            $("#cart-dropdown").hide();
        };

    },
    function () {
        $(".dropdown-content").hide();
    }
);


$(document).ready(function () {
    setPage(startPage)

    $("#logo-button").click(function (e) {
        e.preventDefault();
        setPage("homepage");
    });


    $("#checkout-button").click(function (e) {
        e.preventDefault();
        setPage("stripe/checkout")
        $(".dropdown-content").hide();
    });

    $("#hiw-button").click(function (e) {
        e.preventDefault();
        setPage("howitworkspage");
    });

    $("#gallery-button").click(function (e) {
        e.preventDefault();
        setPage("gallerypage");
    });

    $("#create-button").click(function (e) {
        e.preventDefault();
        setPage("enterpromtpage");
    });

    $("#login-button").click(function (e) {
        e.preventDefault();
        if (signedIn) {
            setPage("accountpage");
            loadAccountContent();
        } else {
            loadSigninContent();
            setPage("loginpage");
        }
    });

    $("#footer-readmore-button").click(function (e) {
        e.preventDefault();
        if (signedIn) {
            setPage("accountpage");
            loadAccountContent();
        } else {
            loadSigninContent();
            setPage("loginpage");
        }
    });

    $("#customer-service-button").click(function (e) {
        e.preventDefault();
        setPage("customerservicepage");
    });

    $("#terms-and-conditions-button").click(function (e) {
        e.preventDefault();
        setPage("termsandconditionspage");
    });

    $(".dropdwn").hover(
        function () {

            if (shoppingCart.length > 0) {

                $("#empty-cart-dropdown").hide();
                $("#cart-dropdown").show();

            } else {
                $("#empty-cart-dropdown").show();
                $("#cart-dropdown").hide();
            };

        },
        function () {
            $(".dropdown-content").hide();
        }
    );

    $("#about-us-button").click(function (e) {
        e.preventDefault();
        setPage("aboutuspage");
    });

    $("#my-account-button").click(function (e) {
        e.preventDefault();
        if (signedIn) {
            loadAccountContent();
        } else {
            loadSignupContent();
            setPage("loginpage");
            
        }
    });

    retrieveServerPrice();
});


//Updates the cart depending on what is added. 
function updateCartDisplay() {
    var cartDropdown = document.getElementById("cart-dropdown");
    var cartFooter = document.getElementById("cart-footer");

    var itemCount = shoppingCart.length;
    var dropdownHeight = 400;
    var cartFooterTop = -30;

    if (itemCount >= 3) {
        dropdownHeight += (itemCount - 2) * 110;
        cartFooterTop += (itemCount - 2) * 110;
    }

    cartDropdown.style.height = dropdownHeight + "px";
    cartFooter.style.top = cartFooterTop + "px";

    // create the html code dymaicly for the cart
    var cartBox = document.getElementById("cart-box");
    var totalPrice = 0;

    for (var i = 0; i < shoppingCart.length; i++) {

        var cartItem = document.createElement("div");
        cartItem.classList.add("cart-info");

        var image = document.createElement("img");
        image.classList.add("product-img");
        image.src = shoppingCart[i].image;

        var info = document.createElement("div");
        var size = document.createElement("small");
        size.textContent = shoppingCart[i].size;
        var frame = document.createElement("small");
        frame.textContent = shoppingCart[i].frame;
        var margin = document.createElement("small");
        margin.textContent = shoppingCart[i].margin;
        var paper = document.createElement("small");
        paper.textContent = shoppingCart[i].paper;
        info.appendChild(size);
        info.appendChild(document.createElement("br"));
        info.appendChild(frame);
        info.appendChild(document.createElement("br"));
        info.appendChild(margin);
        info.appendChild(document.createElement("br"));
        info.appendChild(paper);

        var quantity = document.createElement("input");
        quantity.type = "number";
        quantity.value = shoppingCart[i].quantity;
        quantity.classList.add("product-quantity");
        quantity.dataset.price = shoppingCart[i].price;
        quantity.min = "1";

        var trashcan = document.createElement("img");
        trashcan.classList.add("trashcan-img");
        trashcan.src = "../static/exampleimages/Trash.png";

        var price = document.createElement("div");
        price.classList.add("price");
        price.textContent = shoppingCart[i].price + " SEK";

        cartItem.appendChild(image);
        cartItem.appendChild(info);
        cartItem.appendChild(quantity);
        cartItem.appendChild(price);
        cartItem.appendChild(trashcan);

        cartBox.appendChild(cartItem);

        totalPrice += shoppingCart[i].price * shoppingCart[i].quantity;

    }

    var total = document.getElementById("total-price-text");
    total.textContent = totalPrice + " SEK";

    // Event listener for changes in quantaty
    $(".product-quantity").off('input').on('change', function () {
        const quantity = $(this).val();
        const index = $(this).closest('.cart-info').index() - 1;
        updateCartQuantity(index, quantity);

    })

    // Event listener for the trach icon
    $(".trashcan-img").on("click", function () {
        const index = $(this).closest('.cart-info').index() - 1;
        removeFromCart(index);

    })
}

//clears the cart fom all products
var clearCartInfoItems = function () {
    const cartInfoItems = document.querySelectorAll(".cart-info");
    cartInfoItems.forEach(function (cartInfoItem) {
        cartInfoItem.remove();
    });
}

//updates the product quantity
var updateCartQuantity = function (index, quantity) {
    shoppingCart[index].quantity = quantity;
    // Uppdaterar both shopping cart and checkout content
    clearCartInfoItems();
    updateCartDisplay();
    clearCheckoutItems();
    updateCheckoutContent();
}

//removes an product from the cart
var removeFromCart = function (index) {
    shoppingCart.splice(index, 1);
    // Uppdaterar both shopping cart and checkout content
    clearCartInfoItems();
    updateCartDisplay();
    clearCheckoutItems();
    updateCheckoutContent();

}

// sends the cart to stripe
var getShoppingCart = function () {
    return shoppingCart;
}

//update the size
function updateSizeSelection(size) {
    currentSize = size;
}

//update the frame
function updateFrameSelection(frame) {
    currentFrame = frame;
}

//update the margin
function updateMarginSelection(margin) {
    currentMargin = margin;
}

//update the paper
function updatePaperSelection(paper) {
    currentPaper = paper;
}

//return the chosen frame
function getPosterFrame() {
    if (currentFrame === null || currentFrame === "none") {
        return "No frame"
    } else if (currentFrame === "white") {
        return "White frame";
    } else if (currentFrame === "brown") {
        return "Brown frame";
    } else if (currentFrame === "black") {
        return "Black frame";
    } else if (currentFrame === "goldenrod") {
        return "Golden frame";
    } else if (currentFrame === "burlywood") {
        return "Sand frame";
    }
}

//return the chosen size
function getPosterSize() {
    if (currentSize === null) {
        return "No size"
    } else if (currentSize === "60x60") {
        return "60x60 cm";
    } else if (currentSize === "50x50") {
        return "50x50 cm";
    } else if (currentSize === "40x40") {
        return "40x40 cm";
    } else if (currentSize === "20x20") {
        return "20x20 cm";
    }
}

//return the chosen margin
function getPosterMargin() {
    if (currentMargin === null || currentMargin === "No margin") {
        return "No margin";
    } else if (currentMargin === "10%") {
        return "10% margin";
    } else if (currentMargin === "20%") {
        return "20% margin";
    } else if (currentMargin === "30%") {
        return "30% margin";

    }
}

//return the chosen paper type
function getPaperType() {
    if (currentPaper === "matte") {
        return "Matte paper"
    } else if (currentPaper === "glossy") {
        return "Glossy paper"
    }

}

//return the price for the poster
function getPosterPrice() {
    return calculatePriceCustomization();
}


//GEt the pricing from the back end
function retrieveServerPrice() {
    $.ajax({
        url: host + '/pricing',
        type: 'GET',
        success: function (response) {
            itemPrice = response;
        }

    });
}

//When loaded set the first page as home page and activet the funculaity of the navbar buttons


//function that is called from the footer when pressing the readmore button
function loginpage() {
    $("#view-container").load("views/loginpage.html");
}
//function that is called from the footer when pressing the sendemail button
function sendEmail() {
    const emailAddress = 'hello@posteraized.com';
    const body = 'Hej PosterAIzed!';
    const mailtoLink = `mailto:${emailAddress}?body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
}


//swich viwe to enter pormt page
function startCreating() {
    $("#view-container").load("views/enterpromtpage.html")
    $(window).scrollTop(0);
}


