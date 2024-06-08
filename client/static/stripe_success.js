


function paymentSuccessful(){
    let jwtToken = JSON.parse(sessionStorage.getItem('auth')).token;
    let url = '/payment-success';

    resetURL("success");
  
    $.ajax({
      url: url,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + jwtToken
      },
      success: function(response) {
        setPage("stripe/success");
      },
      error: function(xhr) {
        document.getElementById('#stripe success').innerHTML= "<section><p>Something went wrong</p></section>";
      }
    });
  }

  $(document).ready(function () {
    paymentSuccessful();
  });