//Set to the canseled payment page after a transaction is compleat
function paymentUnsuccessful(){
    let jwtToken = JSON.parse(sessionStorage.getItem('auth')).token;
    let url = '/payment-cancel';
  
    $.ajax({
      url: url,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + jwtToken
      },
      success: function(response) {
        setPage("stripe/cancel");
      },
      error: function(xhr) {
        document.getElementById('#stripe success').innerHTML= "<section><p>Something went wrong</p></section>";
      }
    });
  }

  $(document).ready(function () {
    paymentUnsuccessful();
  });