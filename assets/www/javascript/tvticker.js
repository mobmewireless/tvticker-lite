

(function($) {
    // Add clone method to Zepto
    $.fn.clone = function(){
        var ret = [];
        this.each(function(){
            ret.push(this.cloneNode(true));
        });
        return ret;
    };
})(Zepto);


$.jQTouch({
    icon: 'jqtouch.png',
    statusBar: 'black',
    preloadImages: [],
    startupScreen: 'images/splash.png',
    icon: 'images/logo_32.png',
    trackScrollPositions: true
});


$(function setupFlickable() {
    var itemWidth = $('.flickable').width();
    $('.flickable .page').width(itemWidth - 1);
    Flickable('.flickable', {
        itemWidth: itemWidth,
        enableMouseEvents: true,
        showIndicators: false,
    });
});

/* RPC */

(function setupRPC() {

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
    };
}());


var Show = function(attrs) {

    var self = this;
    $.extend(self, attrs);

    self.minsToStart = function() {
        var milli = Date.parse(this.air_time_start) - Date.now();
        return Math.floor(milli / 60000);
    };
    
    self.minsToEnd = function() {
        var milli = Date.parse(this.air_time_end) - Date.now();
        return Math.floor(milli/ 60000);
    };

    self.hasStarted = function() { 
        return self.minsToStart() < 0;
    };


    self.populateDetails = function(elem) {
        $('.title', elem).text(self.name);
        $('.category', elem).text(self.category.name.replace(/:/, '> '));
        $('.channel', elem).text('on ' + self.channel.name);
        
        if (self.hasStarted()) {
            var t = self.minsToEnd(),
            time_left = t + (t==1 ? ' min ' : ' mins ') + 'left';
        } else {
            var t = self.minsToStart(),
            time_left = 'in ' + t + (t==1 ? ' min ' : ' mins ');
        }
        $('.time-left', elem).text(time_left);
        $('.rating', elem).addClass('r' + Math.min(3, Math.floor(self.rating)));

        return elem;
    }
}

Show.nowShowing = function(limit, callback) {
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
};


Show.laterToday = function(limit, callback) {
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
};



$(function loadNowShowing() {
    /* Loads & sets up the now-showing page */

    var count=20,
        container=$('#now-showing'),
        template=$('#now-showing li.template');
    
    Show.nowShowing(count, function(shows) {
        $.each(shows, function(i, show) {
            var item = show.populateDetails($(template).clone());
            $(item).removeClass('template');
            $(container).prepend(item);
        });
        // Trim list tail, save the template item
        $('.show:not(.template)', container).slice(count).remove();
        
        // Set height of parent to height of the container
        $('.flickable').height($(container).height());
    });
});

$(function loadLaterToday() {
    /* Loads & sets up the later-today page */

    var count=20,
        container=$('#later-today'),
        template=$('#later-today .template');

    Show.laterToday(count, function(shows) {
        // Group & sort by category names
        var categories={},
            names=[];
        $.each(shows, function(i, show) {
            var name = show.category.name.split(/:/)[0];
            if (!categories[name]) {
                categories[name] = [];
                names.push(name);
            }
            categories[name].push(show);
        });

        names.sort();

        // Clear current list & add to it
        $('.category:not(.template)', container).remove();
        $.each(names, function(i, name) {

            var categoryItem = $(template).clone();
            $(categoryItem).removeClass('template');
            $('.show', categoryItem).remove(); // remove the empty show item
            $('.category-name', categoryItem).text(name);
            
            $(categories[name]).each(function(i, show) {
                var showItem = show.populateDetails($('.show', template).clone());
                $('.shows', categoryItem).append(showItem);
            });

            $(container).append(categoryItem);
        });

    });
});