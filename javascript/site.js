
(function($) {
    $.fn.clone = function(){
        var ret = [];
        this.each(function(){
            ret.push(this.cloneNode(true))
        });
        return ret;
    };
})(Zepto);

var jQT = $.jQTouch({
      icon: 'jqtouch.png',
      statusBar: 'black-translucent',
      preloadImages: [],
});

$(function setup_flickable() {

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


(function setup_rpc() {

    var API_KEY = 'tvticker';
    var RPC_SERVER = 'http://api.tvticker.in/service';
    
    window.rpc_call = function(method, params, c) {
        var timestamp = Date.now();
        var hash = calcMD5(timestamp + API_KEY);
        var rpc_params = [timestamp, hash];
        
        rpc_params.push.apply(rpc_params, params);
        
        $.jsonRPC.withOptions({ 
            endPoint: RPC_SERVER
        }, function() {
            this.request(method, { params: rpc_params, success: c, error: c });
        });
    }
}());

var Show = function(attrs) {

    var self = this;
    $.extend(this, attrs);

    $.each(attrs, function(name, val) {
        self[name] = val;
    });

    self.mins_start = function() {
        var milli = Date.parse(this.air_time_start) - Date.now();
        return Math.floor(milli / 60000);
    }
    
    self.mins_end = function() {
        var milli = Date.parse(this.air_time_end) - Date.now();
        return Math.floor(milli/ 60000);
    }

    self.has_started = function() { 
        return self.mins_start() < 0;
    }

    return this;
}

Show.now_showing = function(limit, callback) {
    var params = [Date(), 'now', (limit || 20)];
    rpc_call('programs_for_current_frame', params, function(response) {
        var shows = [];
        for (i in response.result) {
            var show = new Show(response.result[i].program);
            Show[show.id] = show;
            shows.push(show);
        }
        callback(shows);
    });
}

Show.later_today = function(limit, callback) {
    var params = [Date(), 'later', (limit || 20)];
    rpc_call('programs_for_current_frame', params, function(response) {
        var shows = [];
        for (i in response.result) {
            var show = new Show(response.result[i].program);
            Show[show.id] = show;
            shows.push(show);
        }
        callback(shows);
    });
}

$(function load_now_showing() {

    var container = $('ul#now-showing').first();
    var template_item = $(container).find('li.template').first();

    function show_entry(show) {

        var new_item = $(template_item).clone();
        $(new_item).removeClass('template');
        $(new_item).find('.details').data('show-id', show.id);
        $(new_item).find('.name').text(show.name);
        $(new_item).find('.category').text(show.category.name);
        $(new_item).find('.rating').attr('data-rating', show.rating);
        $(new_item).find('.channel').text(show.channel.name);

        if (show.has_started()) {
            var t = show.mins_end(),
            m = (t==1 ? 'min' : 'mins');
            $(new_item).find('.time-left').text(t+' ' + m +' left');
        } else {
            var t = show.mins_start(),
            m = (t==1 ? 'min' : 'mins');
            $(new_item).find('.time-left').text('in '+ show.mins_start() +' '+m);
        }
        
        return new_item;
    }


    var count = 20;
    Show.now_showing(count, function(shows) {
        if (shows.length > 0) // empty current list
            $(container).find('li:not(.template)').remove();

        $.each(shows, function(i, show) {
            $(container).append(show_entry(show));
        });
    });

});

$(function load_later_today() {
    var count = 20;
    var container = $("#later-today");
    var template = $(container).find('.template').first();

    function new_category_container(category_name) {
        var new_category = $(template).clone();
        $(new_category).removeClass('template');
        $(new_category).find('.name').first().text(category_name);
        return new_category;
    }

    function new_show(show) {
        var new_show = $(template).find('li.show').clone();
        $(new_show).removeClass('template');
        $(new_show).find('.details').data('show-id', show.id);
        $(new_show).find('.name').text(show.name);
        $(new_show).find('.category').text(show.category.name);
        $(new_show).find('.rating').attr('data-rating', show.rating);
        $(new_show).find('.channel').text(show.channel.name);
        return new_show;
    }

    Show.later_today(count, function(shows) {

        if (shows.length > 0) // empty current list
            ;//$(container).find('div:not(.template)').remove();

        var categories={}, category_names=[];
        $.each(shows, function(i, show) {
            var name = show.category.name.split(':')[0];
            if (!categories[name]) {
                categories[name] = [];
                category_names.push(name);
            }
            categories[name].push(show);
        });
        category_names.sort();

        $.each(category_names, function(i, name) {
            var category_container = new_category_container(name);
            $(container).append(category_container);
            $.each(categories[name], function(i, show) {
                $(category_container).find('ul').append(new_show(show));
            });
        });

    });
});

