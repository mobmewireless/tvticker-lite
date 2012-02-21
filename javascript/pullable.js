
function pullable(id, callback) {

    var messages = {
        pull: "&#8675; Pull down to refresh",
        release: "&#8673; Release to refresh"
    };

    var scrollable = $(id).find('.scrollable');

    function state(newstate) {
        if (newstate)
            $(scrollable).data('pullable-state', newstate);
        return $(scrollable).data('pullable-state');
    }

    function reset_pullable_ui() {
        if (!state())
            $(scrollable).prepend('<div class="pullable"></div>');

        $(scrollable).find('.pullable').
            css({ position: 'relative', zIndex: 0 }).
            html(messages.pull).
            hide();

        state('init');
    }


    reset_pullable_ui();
    var pullable = $(scrollable).find('.pullable');

    $(scrollable).
        bind('scrollability-scroll', function(e) {
            if ('init' == state()) {
                if (e.position >= 5 && e.position < 60)
                    $(pullable).show();
                else if (e.position >= 60) {
                    state('pulled');
                    $(pullable).html(messages.release);
                }
            }
        }).
        bind('scrollability-takeoff', function() {
            if ('pulled' == state()) {
                state('released');
                callback.call(pullable, reset_pullable_ui);
            }
        }).
        bind('scrollability-animate', function() {
            if ('init' == state())
                $(pullable).hide();
        })
}

$(function() {

    function format_date(epoch) {
        return epoch;
    }

    var last_updated = Date.now();
    pullable('#page1', function(resetfn) {
        $(this).html('<div>Last updated at ' + format_date(last_updated) + '</div>' +
                '<div>Updating program list..</div>');
        window.setTimeout(function() {
            last_updated = Date.now();
            resetfn();
        }, 5000);
    });
});