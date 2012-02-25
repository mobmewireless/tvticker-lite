
(function($) {
    // Add clone method to Zepto
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

$(function setup_iscroll() {
    window.scrollers = {
        now_showing: new iScroll('now-showing', { hScroll:false, checkDOMChanges:false }),
        later_today: new iScroll('later-today', { hScroll:false, checkDOMChanges:false })
    }
});


$(function setup_flickable_pages() {
    /* Configures flickable for #start pages  */

    var fullwidth = $('#start .flickable').width(),
        navwidth  = $('#navbar > div > div').width(),
        pagecount = $('#navbar > div > div').size();

    // Set the width of each page, adjust for border & margin thickness
    var p = $('#start .flickable .page');
    var thickness =  (parseInt($(p).css('border-left-width'))
                     + parseInt($(p).css('border-right-width'))
                     + parseInt($(p).css('margin-left'))
                     + parseInt($(p).css('margin-right')));
    $(p).width(fullwidth - thickness);

    function setnav(pageno, skip_animation) {
        // position navbar
        var pos = (navwidth * pagecount - navwidth * (pageno + 1));
        if (skip_animation) {
            $('#navbar > div').css({ left: pos + 'px' });
        } else {
            $('#navbar > div').animate({ left: pos + 'px' }, 5000, 'swing');
        }
    }
    setnav(0);

    Flickable('#start .flickable', {
        itemWidth: fullwidth,
        enableMouseEvents: true,
        showIndicators: false,
        callback: setnav,
        onEventDrop: function() {
            // unset active buttons
            $('.active').removeClass('active');
        }
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
    $.extend(self, attrs);

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

    return self;
}

Show.now_showing = function(limit, callback) {
    var params = [Date(), 'now', (limit || 20)];
    rpc_call('current_frame_full_data', params, function(response) {
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
    rpc_call('current_frame_full_data', params, function(response) {
        var shows = [];
        for (i in response.result) {
            var show = new Show(response.result[i].program);
            Show[show.id] = show;
            shows.push(show);
        }
        callback(shows);
    });
}

Show.populate_details = function(show, element) {

    $('.name', element).text(show.name);
    $('.category', element).text(show.category.name);
    $('.channel', element).text(show.channel.name);
    $('.rating', element).attr('data-rating', show.rating);

    if (show.has_started()) {
        var t = show.mins_end(),
        time_left = t + (t==1 ? ' min ' : ' mins ') + 'left';
    } else {
        var t = show.mins_start(),
        time_left = 'in ' + t + (t==1 ? ' min ' : ' mins ');
    }

    $('.time-left', element).text(time_left);
    $(element).prop('hash', $(element).attr('href'));

    return element;
}

$(function load_now_showing() {

    var count = 20,
        container = $('#now-showing ul'),
        template  = $('.template', container);
    
    
    function new_show_item(show) {
        var s = $(template).clone();
        return Show.populate_details(show, $(s).removeClass('template'));
    }

    Show.now_showing(count, function(shows) {
        $.each(shows, function(i, show) {
            $(container).append(new_show_item(show));
            scrollers.now_showing.refresh();
        });
    });
});

$(function load_later_today() {
    var count = 20,
        container = $('#later-today > div'),
        template = $(container).find('.template').first();

    function new_category_item(name) {
        var c = $(template).clone();
        $(c).removeClass('template');
        $('.name', c).first().text(name);
        return c;
    }

    function new_show_item(show) {
        var s = $(template).find('.show').clone();
        return Show.populate_details(show, $(s).removeClass('template'));
    }

    Show.later_today(count, function(shows) {
        var categories = {},
            names = [];
        $.each(shows, function(i, show) {
            var name = show.category.name.split(':')[0];
            if (!categories[name])
            {
                categories[name] = [];
                names.push(name);
            }
            categories[name].push(show);
        });

        names.sort();
        $.each(names, function(i, name) {
            var category_container = new_category_item(name);
            $(container).append(category_container);
            $.each(categories[name], function(i, show) {
                $('ul', category_container).append(new_show_item(show));
            });
        });
        scrollers.later_today.refresh();
    });
});


