function loadPrices() {
  updatePriceSize(currentSize);
  updatePriceFrame();
  updatePricePaperType();
};


// sets the active image based on the id (id from database)
function setActiveImageId(id) {
  sessionStorage.setItem('currentimageid', id);
}

// gets the currently active image
function getActiveImageId() {
  const currentimageid = sessionStorage.getItem('currentimageid');
  return currentimageid.replace(/"/g, '');
}

// function to add the customized image to the shopping cart
function addToCart() {

  const imageClone3 = $("#image-frame-large .imagecust");

  let item = {
    image: imageClone3.attr("src"),
    frame: getPosterFrame(),
    size: getPosterSize(),
    paper: getPaperType(),
    price: getPosterPrice(),
    margin: getPosterMargin(),
    quantity: 1,
    imageid: getActiveImageId(),
  };

  // Check to see if the poster already exists in the shopping cart
  let itemIndex = -1;
  for (let i = 0; i < shoppingCart.length; i++) {
    const cartItem = shoppingCart[i];
    if (cartItem.image === item.image && cartItem.frame === item.frame && cartItem.size === item.size && cartItem.price === item.price && cartItem.paper === item.paper && cartItem.margin === item.margin) {
      itemIndex = i;
      break;
    }
  }

  // If it exists update the quantity
  if (itemIndex !== -1) {
    let originalQuantity = shoppingCart[itemIndex].quantity;
    shoppingCart[itemIndex].quantity = originalQuantity + 1;
  } else {
    shoppingCart.push(item);
  }

  clearCartInfoItems();
  updateCartDisplay();

  $("#cart-dropdown").show();

}

// function for changing smaller pictures
function changePicture() {
  // get the element by id i.e. the two small frames, and sets the image to the corresponding path
  document.getElementById(
    "image-frame-small-upper-picture"
  ).style.backgroundImage = "url('../static/exampleimages/owl2.png')";
  document.getElementById(
    "image-frame-small-lower-picture"
  ).style.backgroundImage = "url('../static/exampleimages/owl2.png')";
}

// just the same as above but different pictures
function changePicture2() {
  document.getElementById(
    "image-frame-small-upper-picture"
  ).style.backgroundImage = "url('../static/exampleimages/owl4.png')";
  document.getElementById(
    "image-frame-small-lower-picture"
  ).style.backgroundImage = "url('../static/exampleimages/owl4.png')";
}

// function to change the button text for the gid menu alternatives 
function replaceButtonText(buttonId, text) {
  if (document.getElementById) {
    updatePriceCustomization(buttonId, text);
    displayPriceCustomization();
    var button = document.getElementById(buttonId);
    if (size) {
      document.getElementById("size").innerHTML = size + " cm" + "&nbsp;&nbsp&nbsp;-&nbsp;&nbsp&nbsp;" + itemPrice["size"][size] + ":-";
    }
    if (frame) {
      document.getElementById("frame").innerHTML = frameColor + "&nbsp;&nbsp&nbsp;-&nbsp;&nbsp;&nbsp" + itemPrice["frame"][size] + ":-";
    } else {
      document.getElementById("frame").innerHTML = "no frame";
    }
    if (glossy) {
      document.getElementById("papertype").innerHTML = "glossy" + "&nbsp;&nbsp&nbsp;-&nbsp;&nbsp;&nbsp" + itemPrice["glossy"][size] + ":-";
    } else {
      document.getElementById("papertype").innerHTML = "matte";
    }
    if (margin != "None") {
      document.getElementById("whitemargin").innerHTML = margin;
    } else {
      document.getElementById("whitemargin").innerHTML = "none";
    }
  }
}


var size = false;
var frame = false;
var frameColor = false;
var margin = false;
var glossy = false;

// function to update the overall prices when changing options 
function updatePrice(buttonId, text) {
  if (document.getElementById) {
    updatePriceCustomizationGrid(buttonId, text);
    displayPriceCustomization();
  }
}

// function to update the price when changing size
function updatePriceSize(button) {
  let sizes = itemPrice["size"]
  for (let key in sizes) {
    if (key == button) {
      document.getElementById("size-heading").innerHTML = sizes[key] + ":-";
    }
  }
  currentSize = button;
  updatePriceFrame();
  if (glossy) {
    document.getElementById("papertype-heading").innerHTML = itemPrice["glossy"][currentSize] + ":-";
  } else {
    document.getElementById("papertype-heading").innerHTML = "0 :-";
  }
}

// same as above but for frame
function updatePriceFrame() {
  if (frame) {
    let sizes = itemPrice["frame"];
    for (let key in sizes) {
      if (key == currentSize) {
        document.getElementById("frame-heading").innerHTML = sizes[key] + ":-";
      }
    }
  } else {
    document.getElementById("frame-heading").innerHTML = "0:-";
  }
}

function updatePricePaperType() {
  if (glossy) {
    let sizes = itemPrice["glossy"];
    for (let key in sizes) {
      if (key == currentSize) {
        document.getElementById("papertype-heading").innerHTML = sizes[key] + ":-";
      }
    }
  } else {
    document.getElementById("papertype-heading").innerHTML = "0:-"
  }
}
// updates the prices for the text above the different options 
function updatePriceCustomizationGrid(button, text) {
  if (button == "size") {
    size = text;
    updatePriceSize(text);
    document.getElementById("GlossyDropDownPricing").innerHTML = itemPrice["glossy"][size] + ":-";
  } else if (button == "frame") {
    if (text != "No frame") {
      frame = true;
      frameColor = text;
    } else {
      frame = false;
      frameColor = false;
    }
    updatePriceFrame();
  } else if (button == "whitemargin") {
    if (text != "none") {
      margin = text;
    } else {
      margin = false;
    }
  } else if (button == "papertype") {
    if (text == "Glossy") {
      glossy = true;
    } else {
      glossy = false;
    }
    updatePricePaperType();
  }

}

// Additional functionality to update price tags 
function updatePriceCustomization(button, text) {
  if (button == "size") {
    size = text;
    let frames = document.getElementsByClassName("framePricing");
    for (let key in frames) {
      frames[key].innerHTML = itemPrice["frame"][size] + ":-";
    }
    document.getElementById("GlossyDropDownPricing").innerHTML = itemPrice["glossy"][size] + ":-";
  } else if (button == "frame") {
    if (text != "No frame") {
      frame = true;
      frameColor = text;
    } else {
      frame = false;
      frameColor = false;
    }
  } else if (button == "whitemargin") {
    if (text != "none") {
      margin = text;
    } else {
      margin = false;
    }
  } else if (button == "papertype") {
    if (text == "Glossy") {
      glossy = true;
      document.getElementById("papertype-heading").innerHTML = itemPrice["glossy"][currentSize] + ":-";
    } else {
      glossy = false;
      document.getElementById("papertype-heading").innerHTML = "0 :-";
    }
  }

}


// function that takes the price for each option and calculates the total
function calculatePriceCustomization() {
  let totalPrice = 0;
  if (size) {
    totalPrice = itemPrice["size"][size];
    if (frame) {
      totalPrice += itemPrice["frame"][size];
    }
    if (glossy) {
      totalPrice += itemPrice["glossy"][size];
    }
  }
  return totalPrice;
}

// a function that displays the calculated price
function displayPriceCustomization() {
  document.getElementById("priceBoxText").innerHTML = calculatePriceCustomization() + ":-";
}

// sets the starting price, used when dropdown is active 
function startPrice() {
  let sizes = itemPrice["size"];
  for (let key in sizes) {
    document.getElementById(key + "DropDownPricing").innerHTML = sizes[key] + ":-";
  }
  document.getElementById("standardDropDownPricing").innerHTML = "0 :-";
  replaceButtonText("size", "40x40");
  replaceButtonText("frame", "No frame");
  replaceButtonText("whitemargin", "None");
}

// sets the price when grid is active 
function startPrice2() {
  document.getElementById("size-heading").innerHTML = "200 :-";
  document.getElementById("frame-heading").innerHTML = " 0 :-";
  document.getElementById("papertype-heading").innerHTML = " 0 :-";
}


var storedBtnsize = 1;
var storedBtnFrame = 0;
var storedBtnMargin = 0;
var storedBtnPapertype = 0;

// toggle size buttons
function initEventListeners() {
  const sizeBtns = document.querySelectorAll('.size-radio-btn');
  const frameBtns = document.querySelectorAll('.frame-radio-btn');
  const marginBtns = document.querySelectorAll('.margin-radio-btn');
  const papertypeBtns = document.querySelectorAll('.papertype-radio-btn');

  var checkedBtnSize = storedBtnsize; // current selected button (default when entering customize poster view)


  // sets event for the different size buttons 
  sizeBtns.forEach((item, i) => { // looping through each button
    item.addEventListener('click', () => { // adding click event to each 

      sizeBtns[checkedBtnSize].classList.remove('check'); // removing check class from the current button
      item.classList.add('check'); // adding check class to clicked button
      if (checkedBtnSize != storedBtnsize) {
        checkedBtnSize = storedBtnsize;
      } else {
        checkedBtnSize = i;
      }

      storedBtnsize = i;
    })

  })
  sizeBtns[storedBtnsize].click();
  var checkedBtnFrame = storedBtnFrame; // current selected button (default when entering customize poster view)


  // sets event for the different frame buttons 
  frameBtns.forEach((item, i) => { // looping through each button
    item.addEventListener('click', () => { // adding click event to each 
      frameBtns[checkedBtnFrame].classList.remove('check'); // removing check class from the current button
      item.classList.add('check'); // adding check class to clicked button
      if (checkedBtnFrame != storedBtnFrame) {
        checkedBtnFrame = storedBtnFrame;
      } else {
        checkedBtnFrame = i;
      }
      storedBtnFrame = i; // updating the variable
    })
  })
  frameBtns[storedBtnFrame].click();

  var checkedBtnMargin = storedBtnMargin; // current selected button (margin)

  // sets event for the different margin buttons 
  marginBtns.forEach((item, i) => { // looping through each button
    item.addEventListener('click', () => { // adding click event to each 
      marginBtns[checkedBtnMargin].classList.remove('check'); // removing check class from the current button
      item.classList.add('check'); // adding check class to clicked button
      if (checkedBtnMargin != storedBtnMargin) {
        checkedBtnMargin = storedBtnMargin;
      } else {
        checkedBtnMargin = i;
      }
      storedBtnMargin = i; // updating the variable
    })
  })
  marginBtns[storedBtnMargin].click();

  var checkedBtnPapertype = storedBtnPapertype; // current selected button (papertype)

  // sets event for the different papertype buttons 
  papertypeBtns.forEach((item, i) => { // looping through each button
    item.addEventListener('click', () => { // adding click event to each 
      papertypeBtns[checkedBtnPapertype].classList.remove('check'); // removing check class from the current button
      item.classList.add('check'); // adding check class to clicked button
      if (checkedBtnPapertype != storedBtnPapertype) {
        checkedBtnPapertype = storedBtnPapertype;
      } else {
        checkedBtnPapertype = i;
      }
      storedBtnPapertype = i; // updating the variable
    })
  })
  papertypeBtns[storedBtnPapertype].click();
} 


//Change the border of the image dempening in chose
function changeBorder1() {
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.width = "50px";
  element.style.height = "50px";
  element.style.left = "84px";
  element.style.top = "42px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.width = "50px";
  element.style.height = "50px";
  element.style.left = "93px";
  element.style.top = "54px";
  updatePriceSize("20x20");
  updateSizeSelection("20x20");
  updatePrice('size', '20x20');
}

function changeBorder2() {
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.width = "60px";
  element.style.height = "60px";
  element.style.left = "79px";
  element.style.top = "37px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.width = "60px";
  element.style.height = "60px";
  element.style.left = "88px";
  element.style.top = "49px";
  updatePriceSize("40x40");
  updateSizeSelection("40x40");
  updatePrice('size', '40x40');
}

function changeBorder3() {
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.width = "70px";
  element.style.height = "70px";
  element.style.left = "74px";
  element.style.top = "32px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.width = "70px";
  element.style.height = "70px";
  element.style.left = "83px";
  element.style.top = "44px";
  updatePriceSize("50x50");
  updateSizeSelection("50x50");
  updatePrice('size', '50x50');
}

function changeBorder4() {
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.width = "80px";
  element.style.height = "80px";
  element.style.left = "70px";
  element.style.top = "28px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.width = "80px";
  element.style.height = "80px";
  element.style.left = "79px";
  element.style.top = "40px";
  updatePriceSize("60x60");
  updateSizeSelection("60x60");
  updatePrice('size', '60x60');
} 

//Set the frame of the image depending on chose
function changeFrame0() {
  var element = document.getElementById("image-frame-large");
  element.style.outlineWidth = "0px";
  element.style.outlineColor = "solid black";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.outlineWidth = "0px";
  element.style.outlineColor = "solid black";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.outlineWidth = "0px";
  element.style.outlineColor = "solid black";
  updateFrameSelection("none");
  updatePrice("frame", "No frame");
}
function changeFrame1() {
  var element = document.getElementById("image-frame-large");
  element.style.outlineWidth = "10px";
  element.style.outlineColor = "white";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "white";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "white";
  updateFrameSelection("white");
  updatePrice('frame', 'white');
}
function changeFrame2() {
  var element = document.getElementById("image-frame-large");
  element.style.outlineWidth = "10px";
  element.style.outlineColor = "SaddleBrown";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "SaddleBrown";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "SaddleBrown";
  updateFrameSelection("brown");
  updatePrice('frame', 'brown');
}
function changeFrame3() {
  var element = document.getElementById("image-frame-large");
  element.style.outlineWidth = "10px";
  element.style.outlineColor = "black";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "black";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "black";
  updateFrameSelection("black");
  updatePrice('frame', 'black');
}
function changeFrame4() {
  var element = document.getElementById("image-frame-large");
  element.style.outlineWidth = "10px";
  element.style.outlineColor = "goldenrod";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "goldenrod";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.outlineWidth = "2px";
  element.style.outlineColor = "goldenrod";
  updateFrameSelection("goldenrod");
  updatePrice('frame', 'goldenrod');
}

//Set margin of the image depending on chose
function changeMargin1() {
  var element = document.getElementById("image-frame-large");
  element.style.borderWidth = "0px";
  element.style.borderColor = "white";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.borderWidth = "0px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.borderWidth = "0px";
  updateMarginSelection("No margin");
  updatePrice('whitemargin', 'None');
}
function changeMargin2() {
  var element = document.getElementById("image-frame-large");
  element.style.borderWidth = "10px";
  element.style.borderColor = "white";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.borderWidth = "2px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.borderWidth = "2px";
  updateMarginSelection("10%");
  updatePrice('whitemargin', '10 %');
}
function changeMargin3() {
  var element = document.getElementById("image-frame-large");
  element.style.borderWidth = "20px";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.borderWidth = "4px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.borderWidth = "4px";
  updateMarginSelection("20%");
  updatePrice('whitemargin', '20 %');
}
function changeMargin4() {
  var element = document.getElementById("image-frame-large");
  element.style.borderWidth = "30px";
  var element = document.getElementById("image-frame-small-upper-picture");
  element.style.borderWidth = "6px";
  var element = document.getElementById("image-frame-small-lower-picture");
  element.style.borderWidth = "6px";
  updateMarginSelection("30%");
  updatePrice('whitemargin', '30 %');
}

//Set standard on the image depending on chose
function changeStandard() {
  replaceButtonText('papertype', 'Matte');
}
function changeGlossy() {
  replaceButtonText('papertype', 'Glossy');
}