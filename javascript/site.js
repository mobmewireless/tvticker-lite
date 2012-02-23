var jQT = $.jQTouch({
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
    var RPC_SERVER = 'http://localhost:3000/service';
    
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

    window.Model = {
        shows: {}
    };

    function load_nowshowing() {

        var now_showing = $('ul#now-showing');
        var template_item = $(now_showing).find('li.template');
        
        function show_entry(show) {

            var new_item = $(template_item).clone();
            $(new_item).removeClass('template');
            $(new_item).find('.name').
                text(show.name).
                attr('href', '#show').
                data('show-id', show.id);
            $(new_item).find('.category').text(show.category.name);
            $(new_item).find('.rating').attr('data-rating', show.rating);
            $(new_item).find('.channel').text(show.channel.name);
            $(new_item).find('.time-left').text(show.time_remaining + ' min left');

            return new_item;
        }

        rpc_call('now_showing', [], function(response) {
            var shows = response.result;
            $(shows).each(function(i, show) { 
                Model.shows[show.id] = show;
                $(now_showing).prepend(show_entry(show));
            });
        });
    }

    load_nowshowing();

    $('#show').bind('pageAnimationEnd', function() {
        var show = Model.shows[$(this).data('referrer').data('show-id')];
        $(this).find('.name').text(show.name);
        $(this).find('.description .text').text(show.description);
    });

});




