#KIKA Hacklab Status Information Dashboard

![status.spodeli.org screenshot](img/status-spodeli-org-screenshot.png)

Responsive and mobile-friendly [dashboard page](http://status.spodeli.org/) with status information about [KIKA hacklab](http://b10g.spodeli.org/p/info-in-english.html), including:

* Information about whether the hacklab is currently open or closed and for how long
* The number of signed in, out of the total devices discovered in the local network
* The current Download and Upload traffic
* The current temperature in the hacklab
* A Twitter widget showing one tweet related to KIKA or Free Software Macedonia
* Graphical representation of the number of signed-in/total network devices during several past hours
* Graphical representation of the temperature registered in the hacklab during several past hours
* Information about becoming a Member of the hacklab
* Bank account information for donations
* Links to the [KIKA blog](http://b10g.spodeli.org/) and other related pages

Graphs are implemented with [Flot](http://www.flotcharts.org/) and metrics are stored in [InfluxDB](https://influxdb.com/docs/v0.9/introduction/overview.html).

More information about the metrics database are available [here](https://github.com/skopjehacklab/status.spodeli.org).
