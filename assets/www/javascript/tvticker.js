

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


var jQT = $.jQTouch({
    statusBar: 'black',
    preloadImages: ['images/spinner.gif', 'images/refresh.png', 'images/stripe.png'],
    startupScreen: 'images/splash.png',
    icon: 'images/icon.png',
    trackScrollPositions: true,
    useAnimations: false
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

    self.thumbnail_url = "http://admin.tvticker.in/image/:thumbnail_id/thumbnail".
        replace(/:thumbnail_id/, self.thumbnail_id);

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


    self.populateDetails = function(elem, loadImages) {
        $('.title', elem).text(self.name);
        $('.category', elem).text(self.category.name.replace(/:/, '> '));
        $('.category-sub', elem).text(self.category.name.split(/:/)[1]);
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
        $('.description', elem).text(self.description);


        $(elem).data('show-id', self.id);
        $(elem).prop('hash', $(elem).attr('href'));

        if (!self.thumbnail && loadImages) {

            var thumbImage = $('.thumbnail.large img', elem);
            $(thumbImage).attr('src', 'images/spinner.gif'); // Show a spinner first

            self.thumbnail = new Image();
            self.thumbnail.src = self.thumbnail_url;
            self.thumbnail.onload = function() {
                $(thumbImage).attr('src', self.thumbnail_url);
            }
        }

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

Show.clearCachedData = function() {
    for (id in this) {
        if (!isNaN(parseInt(id))) { // destroy all ID -> objects
            Show[id] = undefined;
        }
    }
}


function loadNowShowing(callback) {
    /* Loads & sets up the now-showing page */

    var count=20,
        container=$('#now-showing .list'),
        template=$('#now-showing li.template');

    // Clear current list
    $('.show:not(.template)', container).remove();
    
    Show.nowShowing(count, function(shows) {
        $.each(shows, function(i, show) {
            var item = show.populateDetails($(template).clone());
            $(item).removeClass('template');
            $(container).prepend(item);
        });
        callback && callback();
    });
}

function loadLaterToday(callback) {
    /* Loads & sets up the later-today page */

    var count=20,
        container=$('#later-today .list'),
        template=$('#later-today .template');

    // Clear current listing
    $('.category:not(.template)', container).remove();

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

        // Add items to list
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

        callback && callback();
    });
}

function reloadPages() {
    
    var loadingElement = $('#loading');
    $(loadingElement).show();

    $('img.refresh').attr('src', "images/spinner.gif");
    Show.clearCachedData();
    loadLaterToday();

    loadNowShowing(function() {
        $(loadingElement).hide();
        $(loadingElement).text('Refreshing..');
        $('img.refresh').attr('src', "images/refresh.png");
    });

}

$(function setupRefresh() {
    $('#loading').css({ top: (screen.height / 2) + 'px' });
    $('.refresh').click(reloadPages);
});

$(function setupShowPage() {
    $('#show-page').bind('pageAnimationEnd', function() {
        var show = Show[$(this).data('referrer').data('show-id')];
        show.populateDetails(this, true);
    });
})

$(reloadPages);