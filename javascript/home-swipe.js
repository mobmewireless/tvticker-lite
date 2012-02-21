function init_interface(){
    $(".flickable > * > *").width($("#page1").width());
    var full_height = $("#jqt").height();
    var toolbar_height = $(".toolbar").height();
    var nav_height = $("#nav_wrapper").height();
    $("#page1").height(full_height - toolbar_height - nav_height);
    var width = $('#nav_bar > div > div').width();
    var count = $('#nav_bar > div > div').size();
    var page = 1;
    $('#nav_bar > div').animate({
				    left: (width*count - width*page)+'px'
				}, 1000, 'swing', function() {
				    // Animation complete.
				});
}
$(document).ready(function(){ 
    init_interface();
    Flickable('.flickable', {
      itemWidth: $("#page1").width(),
      showIndicators: false,
      enableMouseEvents: true,
      callback: function(page) {
        var width = $('#nav_bar > div > div').width();
        var count = $('#nav_bar > div > div').size();
        $('#nav_bar > div').animate({
	  left: (width*count - width*(page+1))+'px'
          }, 2000, 'swing', function() {
	      // Animation complete.
	  });
      }
    });
   
});