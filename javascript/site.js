
var API_KEY = 'tvticker';

function rpc_call(method, params, c) {
    var timestamp = Date.now();
    var hash = calcMD5(timestamp + API_KEY);
    var rpc_params = [timestamp, hash];

    rpc_params.unshift.apply(rpc_params, params);

    $.jsonRPC.withOptions({
        endPoint: 'http://192.168.1.79:3000/service'
    }, function() {
        this.request(method, { params: rpc_params, success: c, error: c });
    });
}

function load_now_showing() {

    var now_showing = $('ul#now-showing');
    var template_item = $(now_showing).find('li.template');

    function make_program_item(program) {
        var new_item = $(template_item).clone();
        $(new_item).removeClass('template');
        $(new_item).find('.name').text(program.name);
        $(new_item).find('.category').text(program.category.name);
        $(new_item).find('.rating').attr('data-rating', program.rating);
        $(new_item).find('.channel').text(program.channel.name);
        return new_item;
    }

    rpc_call('now_showing', [], function(response) {
        var programs = response.result;
        $(programs).each(function(i, p) { 
            $(now_showing).prepend(make_program_item(p));
        });
    });

}

$(function() {
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
