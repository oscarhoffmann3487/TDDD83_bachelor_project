
//go back to enter prompt page with the same prompt in place.
function goBackToEnterPrompt() {
  $("#view-container").load("views/enterpromtpage.html", function () {
    let prompt = sessionStorage.getItem("prompt");
    $("#input-writer").val(prompt).trigger("input");

  });
}
 
//go back tp generated posters page, calls from custumazation pages. 
function goBackToGenerated(imglist) {
  $("#view-container").load("views/generatedposters.html", function (_, status, _) {
    if (status == "success") {
      counter = 1;
      imglist.forEach(image => {
        $("#image" + counter).append(image);
        counter++;
      });
    }
  });
}



//Set click lisner on the images to generat cutomize poster page, also cearts button to go back to generadposter(this page)
$(document).ready(function () {
  var imglist = [$("#image1 img"), $("#image2 img"), $("#image3 img"), $("#image4 img")];

  $("#image1").click(function (e) {
    e.preventDefault();
    chooseImage($("#image1 img"), imglist, 1);
  });

  $("#image2").click(function (e) {
    e.preventDefault();
    chooseImage($("#image2 img"), imglist, 2);
  });

  $("#image3").click(function (e) {
    e.preventDefault();
    chooseImage($("#image3 img"), imglist, 3);
  });

  $("#image4").click(function (e) {
    e.preventDefault();
    chooseImage($("#image4 img"), imglist, 4);
  });
});

//the chosen image get displaed on the ustomize poster, with th rifht placement. 
function chooseImage(image, imglist, imageid) {
  imageobjectid = sessionStorage.getItem("image" + imageid);
  setActiveImageId(imageobjectid);

  $(image).removeClass("img-fluid")
  $("#view-container").load("views/customizeposterpage.html", function (_, status, _) {
    if (status == "success") {
      loadPrices();
      var imageClone = $(image).clone(); 
      imageClone.addClass("imagecust"); 
      $("#image-frame-small-upper-picture").append(imageClone);

      var imageClone2 = $(image).clone(); 
      imageClone2.addClass("imagecust");
      $("#image-frame-small-lower-picture").append(imageClone2);

      var imageClone3 = $(image).clone(); 
      imageClone3.addClass("imagecust");
      $("#image-frame-large").append(imageClone3);

    }

    const newButton = $("<button>").attr({
      type: "button",
      class: "btn btn-primary customize-buttons",
      id: "goBackCustomizeBtn"
    }).text("go back");

    newButton.on("click", function () {
      goBackToGenerated(imglist);
    });
    $(".gobackbutton").append(newButton);
  });

}

