// All the credit goes to Glisha

var INFLUXDB_URL = "https://db.softver.org.mk/influxdb/query";
var INFLUXDB_DBNAME = "status";
var noInternetAccess = false;

function updateStatus() {
    var influxdbQuery = $('#status').attr('data-influx-query');
    var status_container = $("#status").parent().parent();
    $.ajax({
        url: INFLUXDB_URL,
        type: 'GET',
        dataType: 'json',
        data: {
            db: INFLUXDB_DBNAME,
            q: influxdbQuery,
            epoch: 'ms'
        }
    }).then(function(response) {
        var now = (new Date()).getTime();
        var last_value = response.results[0].series[0].values[0];
        var timestamp = last_value[0];
        var status = last_value[1];
        var timediff = (now - timestamp) / 1000;

        var timediff_fancy = secondsToString(timediff);
        if (!noInternetAccess) {
            status_container.removeClass('panel-open panel-closed');
            if (status === "CLOSED") {
                $("#status").text("Затворен");
                status_container.addClass('panel-closed');
                $("#status-time").text("веќе " + timediff_fancy);
            } else {
                $("#status").text("Отворен");
                status_container.addClass('panel-open');
                $("#status-time").text("пред " + timediff_fancy);
            }
        }
    });
}

function updateDevices() {
    var influxdbQuery = $('#currentDevices').attr('data-influx-query');
    var devices_container = $("#currentDevices").parent().parent();
    $.ajax({
        url: INFLUXDB_URL,
        type: 'GET',
        dataType: 'json',
        data: {
            db: INFLUXDB_DBNAME,
            q: influxdbQuery,
            epoch: 'ms'
        },
        success: function(response) {
            var total_devices = response.results[0].series[0].values[0][1];
            var str_uredi = 'уреди';
            devices_container.removeClass('panel-danger panel-success');
            devices_container.addClass('panel-success');

            if (total_devices % 10 === 1 && total_devices !== 11) {
                str_uredi = "уред";
            }

            $('.current-devices .value').text("вкупно " + total_devices);
            $('.current-devices .description').text(str_uredi + " на мрежата во КИКА");

            var last_value = response.results[0].series[0].values[0];
            var timestamp = last_value[0];
            var now = (new Date()).getTime();
            var timediff = (now - timestamp) / 1000;
            noInternetAccess = false;
            if (timediff > 3600) {
                noInternetAccess = true;
                var status_container = $("#status").parent().parent();
                status_container.removeClass('panel-open panel-closed');
                $("#status").text("Непознато");
                status_container.addClass('panel-closed');
                var timediff_fancy = secondsToString(timediff);
                $("#status-time").text("нема одговор веќе " + timediff_fancy);
            } else {
                window.console && console.log('timestamp=' + timestamp + ' timediff=' + timediff);
            }
        }
    });
}

function updateNetworkSpeeds() {
    $.ajax({
        url: "http://hacklab.ie.mk/ftp/vnstat/json/average.json?callback=?",
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            var TK = response['Telekabel'];
            var BL = response['Blizoo'];
            $('#rxkbs').text(parseFloat(TK['rxkbs']) + parseFloat(BL['rxkbs']) + " kB/s");
            $('#txkbs').text(parseFloat(TK['txkbs']) + parseFloat(BL['txkbs']) + " kB/s");
        }
    });
}

function updateTempValues() {
    var influxdbQuery = $('.temperature-values').attr('data-influx-query');
    $('.panel-temperature .value').css({
        'color': 'inherit'
    }).html("&#8230;");
    $.ajax({
        url: INFLUXDB_URL,
        type: 'GET',
        dataType: 'json',
        data: {
            db: INFLUXDB_DBNAME,
            q: influxdbQuery,
            epoch: 'ms'
        },
        success: function(response) {

            var columns = response.results[0].series[0].columns;
            var values = response.results[0].series[0].values[0];

            for (var i = 1; i < values.length; i++) {
                var html_output = '';
                if (values[i]) {
                    html_output = values[i] + "&deg;C";
                } else {
                    html_output = "не се мери";
                }
                $("#" + columns[i] + " span.value").html(html_output).css({
                    'color': plot_colors[i - 1]
                });
            }
        }
    });
}

function secondsToString(seconds) {
    var numweeks = Math.round(seconds / (7 * 86400));
    var numdays = Math.round(seconds / 86400);
    var numdays_week = Math.round(numdays - (7 * numweeks));
    var numhours = Math.floor(seconds / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

    var str_numweeks = 'недели';
    var str_numdays = 'дена';
    var str_numdays_week = 'дена';
    var str_numhours = 'часа';
    var str_numminutes = 'минути';

    if (numweeks % 10 === 1 && numweeks !== 11) {
        str_numweeks = "недела";
    }

    if (numdays_week % 10 === 1 && numdays_week !== 11) {
        str_numdays_week = "ден";
    }

    if (numdays % 10 === 1 && numdays !== 11) {
        str_numdays = "ден";
    }

    if (numhours % 10 === 1 && numhours !== 11) {
        str_numhours = "час";
    }

    if (numminutes % 10 === 1 && numminutes !== 11) {
        str_numminutes = "минута";
    }

    if (numdays > 7) {
        if (numdays_week > 0) {
            return numweeks + " " + str_numweeks + " и " + numdays_week + " " + str_numdays_week;
        } else {
            return numweeks + " " + str_numweeks;
        }
    } else if (numhours > 24) {
        return numdays + " " + str_numdays;
    } else {
        return numhours + " " + str_numhours + " и " + numminutes + " " + str_numminutes;
    }
}

// https://github.com/skopjehacklab/infopanel/blob/gh-pages/js/infopanel.js
function shuffle(o) {
    //http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// https://github.com/skopjehacklab/infopanel/blob/gh-pages/js/infopanel.js
function populateTumblr(tumblr_id) {
    var imgs = shuffle(tumblr_api_read.posts);
    var activeClass = '';

    $(imgs).each(function(key, item) {
        if (key < 1) {
            activeClass = 'active';
        } else {
            activeClass = '';
        }
        $(tumblr_id.selector).find(".carousel-inner").append('<div class="item ' + activeClass + '"><img src="' + item['photo-url-500'] + '" ></div>');
    });
}

$(document).ready(function() {

    // Update individual room temperature values on parent button click
    $('.panel-temperature .btn-refresh').click(updateTempValues);

    // Go to the Grafana Dashboard on button click
    $('.btn-grafana').click(function() {
        window.location = "http://grafana.softver.org.mk/";
    });

    // First update
    updateStatus();
    updateDevices();
    updateNetworkSpeeds();
    updateTempValues();

    // Don't populate Tumblr if not on info-panel.html page
    if (window.location.href.indexOf("info-panel") > -1) {
        populateTumblr($("#tumblr"));
        populateTumblr($("#tumblr2"));
        $('.carousel').carousel({
            interval: 8000
        });
    }

    // Update network speeds every 30 seconds
    window.setInterval("updateNetworkSpeeds()", 1000 * 30);

    // Update status, devices and temperature every 5 minutes
    window.setInterval("updateStatus()", 1000 * 60 * 5);
    window.setInterval("updateDevices()", 1000 * 60 * 5);
    window.setInterval("updateTempValues()", 1000 * 60 * 5);

});
