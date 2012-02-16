
function configure_rpc() {
    $.jsonRPC.setup({
        endPoint: 'http://localhost:3000/service'
    });
}

$(function() {
    configure_rpc();
});

function init_interface(){
    var width = $('#nav_bar > div > div').width();
    var count = $('#nav_bar > div > div').size();
    var page = 1;
    $('#nav_bar > div').animate({
				    left: (width*count - width*page)+'px'
				}, 1000, 'swing', function() {
				    // Animation complete.
				});
}
$.jQTouch({
      icon: 'jqtouch.png',
      statusBar: 'black-translucent',
      preloadImages: [],
      slideSelector: "li.slide > a"
});
$(document).ready(function(){ 
    init_interface();
    $(".content-box").width($("#wrapper").width());
    $("#home").bind('swipe', function(event, info){
	console.log(info.direction);

    });

    $("#home").click(function(){
	console.log('tap de');
    });
    $("div[id=star]").raty({ path: "images/" });
    $("#wrapper").iphoneSlide({
      handler: "#pages",
      pageHandler : ".content-box",
      nextPageHandler : '.nextPage',
      prevPageHandler : '.prevPage',
      extrashift : 500,
      easing: "jswing",
      bounce: false,
      autoPlay: false,
      cancelAutoPlayOnResize: true,
      autoCreatePager: false, 
      onShiftComplete: function(elem, page) {
	  var width = $('#nav_bar > div > div').width();
	  var count = $('#nav_bar > div > div').size();
	  console.log($(elem));
	  console.log(page);
	  $('#nav_bar > div').animate({
				 left: (width*count - width*page)+'px'
			     }, 1000, 'swing', function() {
				 // Animation complete.
			     });
      }
    });
}); 
