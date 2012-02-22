$.jQTouch({
      icon: 'jqtouch.png',
      statusBar: 'black-translucent',
      preloadImages: [],
});

$(function() {
    var screenwidth = $('#start .flickable').width();
    var navwidth = $('#nav_bar > div > div').width();
    var pagecount = $('#nav_bar > div > div').size();

    setnav(0, true);
    var page = $('#start .flickable .page');
    var thickness = (parseInt($(page).css('border-left-width'))
                     + parseInt($(page).css('border-right-width'))
                     + parseInt($(page).css('margin-left'))
                     + parseInt($(page).css('margin-right')));
    var pagewidth = screenwidth - thickness;
    $('#start .flickable .page').width(pagewidth);

    function setnav(page, skip_animation) {
        var pos = (navwidth * pagecount - navwidth * (page + 1));
        if (skip_animation)
            $('#nav_bar > div').css({ left: pos + 'px' });
        else
            $('#nav_bar > div').animate({ left: pos + 'px' }, 1000, 'swing');
    }

    Flickable('#start .flickable', {
        itemWidth: screenwidth,
        enableMouseEvents: true,
        showIndicators: false,
        callback: setnav
    });
});


(function() {

    var API_KEY = 'tvticker';
    var RPC_SERVER = 'http://10.0.0.129:3000/service';
    
    window.rpc_call = function(method, params, c) {
        var timestamp = Date.now();
        var hash = calcMD5(timestamp + API_KEY);
        var rpc_params = [timestamp, hash];
        
        rpc_params.unshift.apply(rpc_params, params);
        
        $.jsonRPC.withOptions({ 
            endPoint: RPC_SERVER
        }, function() {
            this.request(method, { params: rpc_params, success: c, error: c });
        });
    }
}());

$(function() {

    function load_nowshowing() {

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

    load_nowshowing();
})
