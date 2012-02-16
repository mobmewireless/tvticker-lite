
function configure_rpc() {
    $.jsonRPC.setup({
        endPoint: 'http://localhost:3000/service'
    });
}

function load_now_showing() {

    var now_showing = $('ul#now-showing');
    var template_item = $(now_showing).find('li.template');

    function make_program_item(program) {
        var new_item = $(template_item).clone();
        $(new_item).removeClass('template');
        $(new_item).find('.name').text(program.name);
        $(new_item).find('.type').text(program.category.name);
        $(new_item).find('.rating').attr('data-rating', program.rating);
        $(new_item).find('.channel').text(program.channel.name);
        return new_item;
    }

    $.jsonRPC.request('now_showing', {
        success: function(response) {
            var programs = response.result;
            $(programs).each(function(i, p) { 
                $(now_showing).append(make_program_item(p));
            })
        }
    });

}

$(function() {
    configure_rpc();
    load_now_showing();
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
