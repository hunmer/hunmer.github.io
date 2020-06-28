$(function() {
  var items = $('#countrySelection-items').width();
  var itemSelected = document.getElementsByClassName('countrySelection-item');
  // $("#countrySelection-items").scrollLeft(200).delay(200).animate({
  //   scrollLeft: "-=200"
  // }, 2000, "easeOutQuad");

  $('#contactUs').bind('mousewheel', function(event) {
    if(event.originalEvent.wheelDelta > 0){
        scrollContent("right", "30px");
    }else{
        scrollContent("left", "30px");
    }
  });

  if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var scrolling = false;
    $(".countrySelection-paddle-right").bind("mouseover", function(event) {
        scrolling = true;
        scrollContent("right");
    }).bind("mouseout", function(event) {
        scrolling = false;
    });

    $(".countrySelection-paddle-left").bind("mouseover", function(event) {
        scrolling = true;
        scrollContent("left");
    }).bind("mouseout", function(event) {
        scrolling = false;
    });
  }

   function scrollContent(direction, px = '3') {
        var amount = (direction === "left" ? "-="+px+"px" : "+="+px+"px");
        $("#countrySelection-items").animate({
            scrollLeft: amount
        }, 1, function() {
            if (scrolling) {
                scrollContent(direction);
            }
        });
    }

});

