/* Modified implementation from https://damjan.softver.org.mk/status.spodeli.org/ */

$(document).ready(function () {
    var INFLUXDB_URL = "https://db.softver.org.mk/influxdb/query";
    var INFLUXDB_DBNAME = "status";
    var GLOBAL_PLOT_OPTIONS = {
        color: "#333",
        highlightColor: "#333",
        legend: {
            margin: [10, 10],
            backgroundColor: "#fff",
            position: "nw"
        },
        shadowSize: 0,
        grid: {
            borderColor: "#ddd",
            margin: {top: 0, left: 20, bottom: 0, right: 0}
        },
        lines: {show: true},
        points: {show: false},
        xaxis: {
            labelWidth: 50,
            mode: "time",
            minTickSize: [15, "minute"]
        },
        colors: plot_colors
    };

    $('div[data-influx-query]').each(refresh_handler);

    $('.btn-refresh').click(function () {
        var element = $(this).parent().parent().parent().parent().children('.panel-body').children('div[data-influx-query]');
        var doit = refresh_plot_element(element);
        element.overlayLoader(doit);
    });

    function refresh_handler() {
        var element = $(this);
        var doit = refresh_plot_element(element);
        element.overlayLoader(doit);
        doit.then(function () {
            element.one("click", refresh_handler);
        });
    }

    function refresh_plot_element(element) {
        var dburl = element.data('influx-url') || INFLUXDB_URL;
        var dbname = element.data('influx-dbname') || INFLUXDB_DBNAME;
        var query = element.data('influx-query');
        var options = element.data('plot-options');
        var options = $.extend({}, GLOBAL_PLOT_OPTIONS, options);
        var promise = get_plot_data(dburl, dbname, query)
                .then(function (response, status) {
                    var series = response.results[0].series[0];
                    return massage_influx_data_for_flot(series, options);
                })
                .then(function (plotdata) {
                    element.plot(plotdata, options);
                });
        return promise;
    }


    function get_plot_data(dburl, dbname, query) {
        return $.ajax({
            url: dburl,
            data: {db: dbname, q: query, epoch: 'ms'}
        });
    }

    function massage_influx_data_for_flot(series, options) {
        var plotdata = [];
        for (var k = 1; k < series.columns.length; k++) {
            plotdata.push(extract_serie(series, k, options));
        }
        return plotdata;
    }

    function numerically(a, b) { return a - b; }

    function extract_serie(series, index, options) {
        var serie = {};
        serie.label = series.columns[index];
        if (options.calcMedian) {
            var values = series.values;
            var results = []
            for (var ix = 1; ix < values.length - 1; ++ix) {
                var moving3point = [values[ix - 1][index], values[ix][index], values[ix + 1][index]]
                var median = moving3point.sort(numerically)[1]
                results.push([values[ix][0], median])
            }
            serie.data = results;
        } else {
            serie.data = series.values.map(function(value) {
                return [value[0], value[index]];
            })
        }
        return serie;
    }
});
(function ($) {
    $.wait = function (time) {
        return $.Deferred(function (dfd) {
            setTimeout(dfd.resolve, time); // use setTimeout internally.
        }).promise();
    };
}(jQuery));
(function ($) {
    $.fn.overlayLoader = function (promise) {
        return this.each(function () {
            var parent = $(this);
            var loader = $('<div class="loader"></div>');
            parent.append(loader);
            if (promise && promise.then) {
                // this is unreliable in jquery < 3.0
                promise.then(function () {
                    loader.remove();
                }, function () {
                    loader.remove();
                });
            }
        });
    };
}(jQuery));