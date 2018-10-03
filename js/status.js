// All the credit goes to Glisha

var INFLUXDB_URL = "https://db.softver.org.mk/influxdb/query";
var INFLUXDB_DBNAME = "status";
var noInternetAccess = false;
var current_status = document.querySelector('#status');
var current_status_time = document.querySelector('#status-time');
var current_devices = document.querySelector('#currentDevices');

function updateStatus() {
  var influxdbQuery = current_status.getAttribute('data-influx-query');
  var status_container = current_status.parentNode.parentElement;
  var request = new URL(INFLUXDB_URL);

  data = {
    db: INFLUXDB_DBNAME,
    q: influxdbQuery,
    epoch: 'ms'
  }

  Object.keys(data).forEach(function (key) {
    request.searchParams.append(key, data[key])
  }) // Za da gi Dodade na URLOT. https://stackoverflow.com/questions/39245994/use-fetch-to-send-get-request-with-data-object

  fetch(request, {
      type: 'GET',
      dataType: 'json',
    })
    .then(function (resp) {
      return resp.json()
    })
    .then(function (response) {
      var now = (new Date()).getTime();
      var last_value = response.results[0].series[0].values[0];
      var timestamp = last_value[0];
      var status = last_value[1];
      var timediff = (now - timestamp) / 1000;

      var timediff_fancy = secondsToString(timediff);
      if (!noInternetAccess) {
        status_container.classList.remove(['panel-open', 'panel-closed']);
        if (status === "CLOSED") {
          current_status.innerText = "Затворен";
          status_container.classList.add(['panel-closed']);
          current_status_time.innerHTML = "веќе " + timediff_fancy;
        } else {
          current_status.innerText = "Отворен";
          status_container.classList.add(['panel-open']);
          current_status_time.innerHTML = "пред " + timediff_fancy;
        }
      }
    })
}


function updateDevices() {
  var influxdbQuery = current_devices.getAttribute('data-influx-query');
  var devices_container = current_devices.parentNode.parentElement;
  var request = new URL(INFLUXDB_URL)

  data = {
    db: INFLUXDB_DBNAME,
    q: influxdbQuery,
    epoch: 'ms'
  }

  Object.keys(data).forEach(function (key) {
      request.searchParams.append(key, data[key])
    }), // Za da gi Dodade na URLOT. https://stackoverflow.com/questions/39245994/use-fetch-to-send-get-request-with-data-object

    fetch(request, {
      type: 'GET',
      dataType: 'json',
    }).then(function (resp) {
      return resp.json()
    })

    .then(function (response) {
      var total_devices = response.results[0].series[0].values[0][1];
      var str_uredi = 'уреди';
      devices_container.classList.remove(['panel-danger', 'panel-success']);
      devices_container.classList.add(['panel-success']);

      if (total_devices % 10 === 1 && total_devices !== 11) {
        str_uredi = "уред";
      }

      document.querySelector('.current-devices .value').innerText = "вкупно " + total_devices + " " + str_uredi;
      document.querySelector('.current-devices .description').innerText = "на мрежата во КИКА";
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

  Object.keys(imgs).forEach(function (key, item) {
    if (key < 1) {
      activeClass = 'active';
    } else {
      activeClass = '';
    }
    document.querySelector(tumblr_id.selector).find(".carousel-inner").append('<div class="item ' + activeClass + '"><img src="' + item['photo-url-500'] + '" ></div>');
  });
}

document.addEventListener('DOMContentLoaded', function (event) {

  function modalVisibleAdd() {
    document.body.classList.add('modal-open');
  }

  function modalVisibleRemove() {
    document.body.classList.remove('modal-open');
  }

  // Hide modal if ESC pressed
  document.addEventListener("keypress", function (e) {
    if (e.keyCode == 27) {
      modalVisibleRemove();
      window.location.hash = '/';
    }
  });

  // Go to the Grafana Dashboard on button click
  document.querySelector('.btn-grafana').addEventListener("click", function (event) {
    window.location = "http://grafana.softver.org.mk/";
  });

  // Toggle class to <body> when .modal-toggle clicked
  document.querySelectorAll('.modal-toggle').forEach(function (element) {
    element.addEventListener("click", function (e) {
      modalVisibleAdd();
    })
  });

  document.querySelectorAll('.modal-close').forEach(function (element) {
    element.addEventListener("click", function (e) {
      modalVisibleRemove();
    })
  });

  // First update
  updateStatus();
  updateDevices();

  // Don't populate Tumblr if not on info-panel.html page
  if (window.location.href.indexOf("info-panel") > -1) {
    populateTumblr(document.getElementById("tumblr"));
    populateTumblr(document.getElementById("tumblr2"));
    document.querySelector('.carousel').carousel({
      interval: 8000
    });
  }

  // Update status, devices and temperature every 5 minutes
  var mins = 1000 * 60;
  window.setInterval(updateStatus, 5 * mins);
  window.setInterval(updateDevices, 5 * mins);
});
