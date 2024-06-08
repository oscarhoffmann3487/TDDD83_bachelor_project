let isGettingPosters = 0;
let isGettingOrderHistory = false;

// Logs the user out
function signout() {
    sessionStorage.removeItem('auth')
    //Keep in mind, might be too aggressive to clear entire sessionstorage
    sessionStorage.clear();
    setPage("homepage")
}

// loads the account content for the signed in user
function loadAccountContent() {

    $("#view-container").load("views/accountpage.html", function (_, status, _) {
        if (status == "success") {

            setWelcomeMessage();
            getOrderHistory();
            getPreviousGeneratedImages(4);
            getPreviousGeneratedImages(20);

        }
    });
}

// set the welcome message based on name of the users account
function setWelcomeMessage() {

    let sessionData = JSON.parse(sessionStorage.getItem('auth'));
    let welcomeHeader = document.getElementById("welcomeheader");
    let welcomemessage = "Welcome, " + sessionData.name + "!";
    if (welcomeHeader) {

        welcomeHeader.innerHTML = welcomemessage;
    }

}

function displayGobackPreviousImages(images, idarray) {

    $("#previously-genereate-img").append('<div class="loading-bar loding-previously" id="loading"></div>');

    let counter = 1;
    images.forEach((imageData) => {
        let imageName = 'previmg' + counter;

        let innerDiv = "<div class= 'col-3 d-flex justify-content-center flex-wrap' id=" + imageName + '></div>'
        $("#previously-genereate-img").append(innerDiv);
        const img = new Image()
        let imagelongdata = `data:image/png;base64,${imageData}`
        img.src = imagelongdata;
        $("#" + imageName).append(img);

        let myid = idarray[counter - 1].toString();

        // Append "Customize" button below the image
        //TODO change to jquery
        const customizeButton = document.createElement('button');
        customizeButton.type = "button"; // Use type "button" for non-submit buttons
        customizeButton.className = "btn btn-secondary text-font btn-sm mt-1 w-50"; // Add "btn-sm" class for smaller button
        customizeButton.innerText = "Customize";
        customizeButton.id = "customizebutton" + counter;
        customizeButton.addEventListener('click', function () { customize(imagelongdata, images, myid, idarray); });// Add event listener for button click
        $("#" + imageName).append(customizeButton);

        counter++;
    });
    $("#loading").remove();
    createGetMoreButton(4);
}

// displays the previous images the user has generated
function displayPreviousImages(images, idarray, number) {

    let counter = 1;

    images.forEach((imageData) => {

        //check if they should be displayed
        if (number == 4 || counter > 4) {

            let imageName = 'previmg' + counter;

            let innerDiv = "<div class= 'col-3 d-flex justify-content-center flex-wrap' id=" + imageName + '></div>'
            $("#previously-genereate-img").append(innerDiv);
            const img = new Image()
            let imagelongdata = `data:image/png;base64,${imageData}`
            img.src = imagelongdata;
            $("#" + imageName).append(img);

            if (number != 4) {
                $("#" + imageName).removeClass("d-flex");
                $("#" + imageName).addClass("d-none");
            }


            let myid = idarray[counter - 1].toString();

            // Append "Customize" button below the image
            //TODO change to jquery
            const customizeButton = document.createElement('button');
            customizeButton.type = "button"; // Use type "button" for non-submit buttons
            customizeButton.className = "btn btn-secondary text-font btn-sm mt-1 w-50"; // Add "btn-sm" class for smaller button
            customizeButton.innerText = "Customize";
            customizeButton.id = "customizebutton" + counter;
            customizeButton.addEventListener('click', function () { customize(imagelongdata, images, myid, idarray); });// Add event listener for button click
            $("#" + imageName).append(customizeButton);
        }


        counter++;
    });
}


// Takes the image from the account page to the customization page when pressing the customize button under the image
function customize(image, imglist, myid, idarray) {
    $("#view-container").load("views/customizeposterpage.html", function (_, status, _) {
        if (status == "success") {
            setActiveImageId(myid);
            var imageClone = new Image();
            imageClone.src = image;
            imageClone.className = "imagecust";
            $("#image-frame-small-upper-picture").append(imageClone);

            var imageClone2 = new Image();
            imageClone2.src = image;
            imageClone2.className = "imagecust";
            $("#image-frame-small-lower-picture").append(imageClone2);

            var imageClone3 = new Image();
            imageClone3.src = image;
            imageClone3.className = "imagecust";
            $("#image-frame-large").append(imageClone3);
        }
        const newButton = $("<button>").attr({
            type: "button",
            class: "btn btn-primary customize-buttons",
            id: "goBackCustomizeBtn"
        }).text("go back");

        newButton.on("click", function () {
            setPage("accountpage")
            $("#view-container").load("views/accountpage.html", function (_, status, _) {
                if (status == "success") {
                    setWelcomeMessage();
                    getOrderHistory();
                    displayGobackPreviousImages(imglist, idarray)
                }
            });
        });
        $(".gobackbutton").append(newButton);
    });
};

// Displays the order history for the user
function displayOrderHistory(orderhistory) {
    var counter = 1;

    orderhistory.forEach((order) => {
        var image = atob(order.base64_image);
        var orderimage = 'data:image/png;base64,' + image;
        var orderdate = order.upload_date;
        var orderquantity = order.quantity;
        var orderprice = order.payment_amount;

        // Create a new row div
        let newRow = $("<div>").attr({
            class: "row m-0 order-item"
        });

        // Create an image element
        let img = $("<img>").attr({
            src: orderimage,
            class: "order-image col-3 p-0 my-2 ml-4 mr-2"
        });

        // Create a div for order details
        let orderDetails = $("<div>").attr({
            class: "order-details text-font col-4 p-0 d-flex flex-column justify-content-center",
        });

        // Create a paragraph element for quantity and amount
        var quantityAmount = document.createElement('p');
        if (orderquantity > 1) {
            quantityAmount.innerHTML = orderquantity + ' items, ' + orderprice + ' SEK';
        } else {
            quantityAmount.innerHTML = orderquantity + ' item, ' + orderprice + ' SEK';
        }
        quantityAmount.classList.add('order-quantity-amount');

        // Create a paragraph element for order date
        let orderDate = $("<p>").attr({
            class: "order-date",
        }).text(orderdate);

        // Append the image, quantity/amount, and order date to the order details div
        orderDetails.append(quantityAmount);
        orderDetails.append(orderDate);

        //Create return option
        let orderReturn = $("<div>").attr({
            class: "order-return text-font col-6 p-0 d-flex justify-content-center"
        });

        //Create text
        let returnText = $("<p>").attr({
            class: "text-font text-end return-text"
        }).text("If there are any problems, please email us!");

        let contactButton = $("<button>").attr({
            type: "button",
            class: "btn btn-secondary text-font h-25 btn-sm mt-1 w-50",
            style: "line-height: 20px;"
        }).text("Go to contact");

        contactButton.on("click", function () {
            setPage("customerservicepage");
        });

        orderReturn.append(returnText);
        orderReturn.append(contactButton);


        // Append the image and order details div to the new row div
        newRow.append(img);
        newRow.append(orderDetails);
        newRow.append(orderReturn);

        // Append the new row div to the row3 container
        $("#order-history").append(newRow);

        counter++;
    });
}

// gets the order history of the user from the database 
async function getOrderHistory() {

    if (!isGettingOrderHistory) { // If the function getOrderHistory is currently running, isGettingOrderHistory is true which prevents duplicate printing of the images

        isGettingOrderHistory = true;

        $("#order-history").append('<div class="loading-bar loding-previously" id="loading-order"></div>');
        var sessionData = JSON.parse(sessionStorage.getItem('auth'));

        // Check if customerid exists in sessionStorage
        if (sessionData && sessionData.customerid) {
            // Retrieve customerid from sessionStorage
            var customerid = sessionData.customerid;

            try {
                var response = await $.ajax({
                    url: "/getOrderHistory",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify({ "customerid": customerid }),
                });
                $("#loading-order").remove();
                if (response.length == 0) {
                    let innerDiv = "<br><h3>Your order history is empty.</h3><h3> Create an image and order it now!</h3>"
                    $("#order-history").append('<div class="text-font text-center col-12">' + innerDiv + '</div>')
                    $("#order-history").append('<button type="purple-button" class="btn btn-secondary text-font w-25 start-creat-button col-4 mb-2" idata-toggle="popover" onclick="startCreating()">start creating</button>');
                }
                displayOrderHistory(response);
            } catch (error) {
                console.error("Failed to fetch images:", error);
            }
        }

        isGettingOrderHistory = false;

    }
}

// gets the previously generated images from the database
async function getPreviousGeneratedImages(number) {

    if (isGettingPosters <= 2) { // If the function getPreviousGeneratedImages is currently running, isGettingPosters is incremente, and can only run 2 times
        isGettingPosters++;

        if (number == 4) {
            $("#previously-genereate-img").append('<div class="loading-bar loding-previously" id="loading"></div>');
        }

        let sessionData = JSON.parse(sessionStorage.getItem('auth'));

        // Check if customerid exists in sessionStorage
        if (sessionData && sessionData.customerid) {
            // Retrieve customerid from sessionStorage
            let customerid = sessionData.customerid;
            try {
                // Make an Ajax request to the get_my_images endpoint
                let response = await $.ajax({
                    url: "/get_my_images",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify({ "userid": customerid, "number": number }),
                });


                if (number == 4) {
                    $("#loading").remove();
                }
                // Access the response data after the promise is resolved
                let images = response.images;
                let imageArray = [];
                let idarray = [];

                //Check if thera are any images previoulsy generated 
                if (images.length == 0 && number == 4) {
                    let innerDiv = " <br> <h3>Once you have created your first image it will be displayed here.</h3><h3> Create one now!</h3>"
                    $("#previously-genereate-img").append('<div class="text-font text-center col-12">' + innerDiv + '</div>')
                    $("#previously-genereate-img").append('<button type="purple-button" class="btn btn-secondary text-font w-25 start-creat-button col-4 mb-2" idata-toggle="popover" onclick="startCreating()">start creating</button>');
                } else {
                    images.forEach(function (image) {
                        let decodedImageData = atob(image.data);
                        idarray.push(image._id);
                        imageArray.push(decodedImageData);
                    });

                    displayPreviousImages(imageArray, idarray, number);
                    if (number != 4 && images.length != 0) {
                        createGetMoreButton(number);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch images:", error);
            }
        }

        isGettingPosters = 0;
    }
}

// creates a get more button 
function createGetMoreButton(number) {
    if (number = 4) {
        $("#previously-genereate-img").append('<button type="purple-button" class="btn btn-secondary text-font mb-2" data-toggle="popover" id="show-more-button" onclick="showMoreImages()">Show more</button>')
    } else {
        $("#show-more-button").remove()
    }
}

// to show more images 
function showMoreImages() {
    $("#show-more-button").remove()
    let children = $("#previously-genereate-img").children();
    for (let i = 4; i <= children.length; i++) {
        $("#previmg" + i).removeClass("d-none")
        $("#previmg" + i).addClass("d-flex")

    }

};


