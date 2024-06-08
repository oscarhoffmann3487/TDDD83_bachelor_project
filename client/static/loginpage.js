let errorSignup = false;
let errorSignin = false;
//keeping track of what form to use

//Set if the sign up or sing in view is shown
function loadSigninContent(){
    switchForm("signin-button", "signup-button");
    console.log("press")
};

function loadSignupContent(){
    switchForm("signup-button", "signin-button");
};

//Set boald text on sign in or sing up when clicked on
function switchForm(active, inactive) {

    if (errorSignin) {
        $("#error-text-signin").removeClass("d-block");
        $("#error-text-signin").addClass("d-none");
        errorSignin = false;
    }


    if (errorSignup) {
        $("#error-text-signup").removeClass("d-block");
        $("#error-text-signup").addClass("d-none");
        errorSignup = false;
    }

    if (formType + "-button" != active) {

        console.log("#" + active);
        $("#" + active).addClass("border border-dark");
        $("#" + inactive).removeClass("border border-dark");
        if (active == "signup-button") {
            $("#name-div").removeClass("d-none");
            $("#name-break").removeClass("d-none");
            $("#login-form-button").html("Sign up");


        } else {
            $("#name-div").addClass("d-none");
            $("#name-break").addClass("d-none");
            $("#login-form-button").html("Sign in");

        }

        formType = active.split("-")[0];
    }
};

//sign in or sign up the user when button is clicked, 
//checks if the login input is correct according to the database
//uplods the sign in values to the database. 
function login(formData) {

    if (formType == "signin") {
        let formInfo = {
            email: formData.email.value,
            password: formData.password.value
        };

        $.ajax({
            url: host + '/login',
            type: "POST",
            data: JSON.stringify(formInfo),
            contentType: "application/json",
            success: function (response) {
                sessionStorage.setItem('auth', JSON.stringify(response));
                loadAccountContent();
                userName = JSON.parse(sessionStorage.getItem("auth")).name;
                $("#login-button").html(profileImg + userName);

            },
            error: function (response) {
                if (response.status === 401) {
                    $("#error-text-signin").removeClass("d-none");
                    $("#error-text-signin").addClass("d-block");
                    errorSignin = true;
                } else {
                    alert("An error occurred, please try again later");
                }
            }


        })

    } else if (formType == "signup") {
        let formInfo = {
            email: formData.email.value,
            password: formData.password.value,
            name: formData.name.value
        };

        $.ajax({
            url: host + '/sign-up',
            type: "POST",
            data: JSON.stringify(formInfo),
            contentType: "application/json",
            success: function (response) {

                $.ajax({
                    url: host + '/login',
                    type: "POST",
                    data: JSON.stringify(formInfo),
                    contentType: "application/json",
                    success: function (response) {
                        sessionStorage.setItem('auth', JSON.stringify(response));
                        loadAccountContent();
                        userName = JSON.parse(sessionStorage.getItem("auth")).name;
                        $("#login-button").html(profileImg + userName);

                    }
                })
                switchForm("singin-button", "singup-button");

            },
            error: function (response) {
                if (response.status === 401) {
                    $("#error-text-signup").removeClass("d-none");
                    $("#error-text-signup").addClass("d-block");
                    errorSignup = true;
                } else {
                    alert("An error occurred, please try again later");
                }
            }
        })

    } else {
        console.log("Something is wrong reload page");
    }
};
