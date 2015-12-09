// All the credit goes to Glisha

$(document).ready(function () {
    var INFLUXDB_URL = "https://db.softver.org.mk/influxdb/query";
    var INFLUXDB_QUERY = "SELECT doorstatus FROM doorstatus where location='hacklab' and time > now() - 24h order by time";
    var INFLUXDB_DBNAME = "status";
//    var test = '';

    function updateStatus() {
        var sega = new Date();
        $.ajax({
            url: INFLUXDB_URL,
            type: 'GET',
            dataType: 'json',
            data: {db: INFLUXDB_DBNAME, q: INFLUXDB_QUERY, epoch: 'ms'},
            success: function (response) {

//                test = response;
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

                if (vrednosti[vrednosti.length - 1][1] === "CLOSED") {
                    $("#status").text("Затворен");
                    $("#status").parent().parent().toggleClass('panel-closed');
                    $("#status-time").text("веќе " + otvoren);
                } else {
                    $("#status").text("Отворен");
                    $("#status").parent().parent().toggleClass('panel-open');
                    $("#status-time").text("пред " + otvoren);
                }

            }
        });
    }

    function secondsToString(seconds) {
        var numhours = Math.floor(seconds / 3600);
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

        return numhours + " часови " + numminutes + " минути ";
    }

    updateStatus();

});