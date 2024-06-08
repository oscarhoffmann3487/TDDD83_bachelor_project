

//Enter a surprise prompt, get the pormps from the data bas
function enterSurprise() {

    $.ajax({
        url: host + '/surprise_me',
        type: "GET",
        contentType: "application/json",
        success: function (response) {
            $("#input-writer").val(response);
            $('#input-writer').val(response).trigger('input');
        }
    })
}

//Get the images based on the prompt given. Given from the promt from Dalle, through the back-end. 
function generateImages() {

    let promt = { promt: $("#input-writer").val() }

    setPage("loadingpage")

    $.ajax({
        url: host + '/fake_geneate_images',
        type: "POST",
        data: JSON.stringify(promt),
        contentType: "application/json",
        success: function (url_list) {

            //använde ready state 4 från lab r webb prog
            $("#view-container").load("views/generatedposters.html", function (_, status, _) {
                if (status == "success") {
                    for (let i = 0; i < url_list.length; i++) {
                        let url = url_list[i]
                        let n = i + 1

                        waterMarkedImage = addWatermark(url)

                        console.log(n)

                        console.log(waterMarkedImage)

                        let img = $('<img>', { class: 'img-fluid', src: waterMarkedImage, alt: "Image " + n })
                        $("#image" + n).append(img)




                    }
                }
            });

        }
    })

}

//Generate the images based on the given promt, go though the back end. 
function loadAI() {

    var token;
    if (sessionStorage.getItem('auth')) {
        token = JSON.parse(sessionStorage.getItem('auth')).token;
    } else {
        token = "";
    }

    $("#view-container").load("views/loadingpage.html")
    $.ajax({
        url: host + '/generateImages',
        type: 'POST',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + token
        },
        data: JSON.stringify({ "prompt": $('#input-writer').val() }),
        success: function (response) {
            $("#view-container").load("views/generatedposters.html", function (_, status, _) {
                if (status == "success") {
                    const images = response.map((item) => item.b64_json);
                    displayImages(images);
                }
            });
        },
        error: function (response) {
            if (response.status === 204) {
                setPage("enterpromtpage");
                alert("Empty prompt, please provide some text");
            } else if (response.status === 500) {
                setPage("enterpromtpage");
                alert("Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowed by our safety system.");
            } else {
                setPage("enterpromtpage");
                alert("An error occurred, please try again");
            }
        }
    });
}

//Display the images given from dalle 
function displayImages(images) {

    var counter = 1;
    images.forEach((image) => {
        var imageName = 'image' + counter;
        const imageContainer = document.getElementById(imageName);
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${image}`; //check if this is needed when response.map is used
        imageContainer.appendChild(img);
        counter++;
    });
    // Second loop to call uploadImageIfLoggedIn and store the return values in sessionstorage
    counter = 1;
    images.forEach(async (image) => {
        returnid = await uploadImageIfLoggedIn(image);
        sessionStorage.setItem('image' + counter, returnid);
        counter++;

    });
}
// temporär hårdkodning ersätt med displayimages() som funkar med dalle2 vid tester
function displayImages2() {


    let prompt = { promt: $("#input-writer").val() }

    $("#view-container").load("views/loadingpage.html")

    $.ajax({
        url: host + '/fake_geneate_images',
        type: "GET",
        // data: JSON.stringify(prompt),
        // contentType: "application/json",

        success: function (images) {
            $("#view-container").load("views/generatedposters.html", function (_, status, _) {
                if (status == "success") {
                    var counter = 1;
                    images.forEach((image) => {
                        let imageName = 'image' + counter;
                        //TODO change to jquery
                        //TODO change to jquery  
                        const imageContainer = document.getElementById(imageName);
                        const img = new Image()
                        imageContainer.appendChild(img);
                        img.src = `data:image/png;base64,${image}`;
                        counter++;
                    });

                    // Second loop to call uploadImageIfLoggedIn and store the return values in sessionstorage
                    counter = 1;
                    images.forEach(async (image) => {
                        returnid = await uploadImageIfLoggedIn(image);
                        sessionStorage.setItem('image' + counter, JSON.stringify(returnid));
                        counter++;
                    });
                }
            });
        }
    })
}


//Save the images in the backend 
async function uploadImageIfLoggedIn(imgFile) {
    var prompt = sessionStorage.getItem("prompt");
    if (sessionStorage.getItem('auth')) {
        var customerId = JSON.parse(sessionStorage.getItem('auth')).customerid;
        // Call the uploadImage function with the logged in user's customerid
        try {
            var returnimageid = await $.ajax({
                url: host + '/upload_image',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    "img_file": imgFile,
                    "prompt": prompt,
                    "customerid": customerId
                }),
            });
            // Handle success response
            return returnimageid;
        } catch (error) {
            // Handle error response
            console.error("An error occurred while uploading image: " + error.responseText);
        }
    } else {
        return null;
    }
}

//Store the promt in  sassion storage
function storePrompt() {
    // Get the user's prompt text from the input-writer element
    let prompt = $("#input-writer").val();
    // Store the prompt text in sessionStorage
    sessionStorage.setItem("prompt", prompt);
}

//makes the tet field dynamic so it gets bigger if needed. 
function dynamicTextField() {
    $(document).ready(function () {
        $('#input-writer').on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
};

//check if the user is loged in or not and dispalty text acodlingly
function isUserLoggedIn() {
    var signedIn = sessionStorage.getItem('auth') != null;
    if (signedIn) {
        $("#notloggedintext").hide();
    } else {
        $("#loggedintext").hide();
    }
}