// All the credit goes to Glisha

var INFLUXDB_URL = "https://db.softver.org.mk/influxdb/query";
var INFLUXDB_DBNAME = "status";
function updateStatus() {
    var influxdbQuery = $('#status').attr('data-influx-query');
    var status_container = $("#status").parent().parent();
    $.ajax({
        url: INFLUXDB_URL,
        type: 'GET',
        dataType: 'json',
        data: {db: INFLUXDB_DBNAME, q: influxdbQuery, epoch: 'ms'},
        success: function (response) {
            var sega = new Date();
            var vrednosti = response.results[0].series[0].values;
            var otvoren = 0;
            for (var i = vrednosti.length - 1; i > 0; i--) {
                item = vrednosti[i - 1];
                if (item[1] !== vrednosti[vrednosti.length - 1][1]) {
                    break;
                } else {
                    var datum = new Date(item[0]);
                    otvoren = sega.getTime() - datum.getTime();
                }
            }

            otvoren = secondsToString(otvoren / 1000);

            status_container.removeClass('panel-open panel-closed');

            if (vrednosti[vrednosti.length - 1][1] === "CLOSED") {
                $("#status").text("Затворен");
                status_container.addClass('panel-closed');
                $("#status-time").text("веќе " + otvoren);
            } else {
                $("#status").text("Отворен");
                status_container.addClass('panel-open');
                $("#status-time").text("пред " + otvoren);
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
        data: {db: INFLUXDB_DBNAME, q: influxdbQuery, epoch: 'ms'},
        success: function (response) {
            var logged_devices = response.results[0].series[0].values[0][1];
            var total_devices = response.results[0].series[0].values[0][2];

            devices_container.removeClass('panel-danger panel-success');

            switch (true) {
                case (logged_devices === 0):
                {
                    devices_container.addClass('panel-danger');
                    str_najaveni = "најавени";
                    break;
                }
                case (logged_devices % 10 === 1):
                {
                    devices_container.addClass('panel-success');
                    str_najaveni = "најавен";
                    break;
                }
                case (logged_devices > 0 || logged_devices === 11):
                {
                    devices_container.addClass('panel-success');
                    str_najaveni = "најавени";
                    break;
                }
            }

            $('#currentDevices').text(logged_devices + " " + str_najaveni + ", од вкупно " + total_devices);
        }
    });
}

function updateNetworkSpeeds() {
    $.ajax({
        url: "http://hacklab.ie.mk/ftp/vnstat/json/average.json?callback=?",
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var TK = response['Telekabel'];
            var BL = response['Blizoo'];

            $('#rxkbs').text(parseFloat(TK['rxkbs']) + parseFloat(BL['rxkbs']) + " kB/s");
            $('#txkbs').text(parseFloat(TK['rxkbs']) + parseFloat(BL['txkbs']) + " kB/s");
        }
    });
}

function secondsToString(seconds) {
    var numhours = Math.floor(seconds / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
    return numhours + " часови и " + numminutes + " минути ";
}

$(document).ready(function () {

    // First update
    updateStatus();
    updateDevices();
    updateNetworkSpeeds();

    // Update network speeds every 30 seconds
    window.setInterval("updateNetworkSpeeds()", 1000 * 30);

    // Update status and devices every 5 minutes
    window.setInterval("updateStatus()", 1000 * 60 * 5);
    window.setInterval("updateDevices()", 1000 * 60 * 5);

});