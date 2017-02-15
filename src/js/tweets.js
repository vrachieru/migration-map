// $(document).ready(function(){
//     var date_input=$('input[name="date"]'); //our date input has the name "date"
//     var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
//     date_input.datepicker({
//       format: 'mm/dd/yyyy',
//       container: container,
//       todayHighlight: true,
//       autoclose: true,
//     })
//   })


var migrationMap = (function() {

  //
  // Map
  //

  var canvas = document.getElementById('worldCanvas');
  var planet = planetaryjs.planet();

  planet.loadPlugin(autocenter({extraHeight: 200}));
  planet.loadPlugin(autoscale({/*extraHeight: 200*/}));
  planet.loadPlugin(planetaryjs.plugins.earth({
    topojson: { file:   'data/world-110m.json' },
    oceans:   { fill:   '#001320' },
    land:     { fill:   '#06304e' },
    borders:  { stroke: '#001320' }
  }));
  planet.loadPlugin(planetaryjs.plugins.zoom({
    scaleExtent: [1, 2000]
  }));
  planet.loadPlugin(planetaryjs.plugins.drag({
    onDragStart: function() {
      this.plugins.autorotate.pause();
    },
    onDragEnd: function() {
    if (config.autorotation && config.projection == 'globe') {
      this.plugins.autorotate.resume();
    }
    }
  }));
  planet.loadPlugin(planetaryjs.plugins.pings());
  planet.loadPlugin(autorotate(10));
  planet.projection.rotate([100, -10, 0]);
  planet.loadPlugin(lines());
  planet.loadPlugin(particles());
  planet.draw(canvas);



  //
  // Globals
  //

  var mode = 'live';

  var stompClient;

  var can_update_tweet_list = true;

  var tweet_list_buffer = []

  var historical_timer;


  var data_source = {
    live: 'http://localhost:8080/websocket',
    historical: 'data/tweets.json', // 'http://localhost:8081/getBetween/{from}/{to}', //
    country_to: 'http://localhost:8081/getCountriesToBetween/{from}/{to}',
    country_from: 'http://localhost:8081/getCountriesFromBetween/{from}/{to}',
  }

//   1486949171561  tweets.js:426:7
// 1486947487137

  var tmp_migration = {}
  var migration = {
    count: 0,
    source: {},
    destination: {}
  }


  var config = {
    projection: 'globe',
    autorotation: true,
    representation: {
      arc: false,
      circle: false,
      particle: true
    },
    top: 'sources',
    playback: {
      speed: 10,
      speed_factor: 1
    }
  }



  //
  // Event handlers
  //

  ////////// Navigation \\\\\\\\\\

  d3.select('#live')
    .on('click', function(d) {
      mode = 'live';
      navigation_common_tasks();
    });

  d3.select('#historical')
    .on('click', function(d) {
      mode = 'historical';
      navigation_common_tasks();
    });

  d3.select('#statistics')
    .on('click', function(d) {
      mode = 'statistics';
      navigation_common_tasks();
    });

  d3.select('#tour')
    .on('click', function(d) {
      mode = 'tour';
      navigation_common_tasks();
    });

  function navigation_common_tasks() {
    select_main_menu_active_item();
    configure_options_panel();
    clear_details_panel();
    configure_details_panel();
    clear_tweet_buffer();
    clear_tweet_panel();
    initialize_interval_picker();
    switch_canvases();
    initialize_current_mode();
  }


  ////////// Options \\\\\\\\\\

  d3.select("#show-menu")
    .on("click", function() {
      d3.select("#menu")
        .classed("invisible", !d3.select("#menu").classed("invisible"));
    });

  ///// Projection
  d3.select('#projection-globe')
    .on('click', function(d) {
      config.projection = 'globe';
      config.autorotation = true;
      planet.withProjection(d3.geo.orthographic().clipAngle(90));
      planet.projection.scale(Math.min(window.innerWidth, window.innerHeight) / 2);
      window.dispatchEvent(new Event('resize'));
      planet.plugins.autorotate.resume();
      options_common_tasks();
    });


  d3.select('#projection-flat')
    .on('click', function(d) {
      config.projection = 'flat';
      config.autorotation = false;
      planet.withProjection(d3.geo.equirectangular().center([8.226692, 46.80121]).scale(1));
      planet.projection.scale(Math.min(window.innerWidth, window.innerHeight) / 2);
      planet.plugins.autorotate.pause();
      options_common_tasks();
    });

  ///// Autorotation
  d3.select('#autorotation-on')
    .on('click', function(d) {
      if (config.projection != 'globe')
        return;

      config.autorotation = true;
      planet.plugins.autorotate.resume();
      options_common_tasks();
    });

  d3.select('#autorotation-off')
    .on('click', function(d) {
      config.autorotation = false;
      planet.plugins.autorotate.pause();
      options_common_tasks();
    });


  ///// Representation
  d3.select('#representation-arc')
    .on('click', function(d) {
      config.representation.arc = !config.representation.arc;
      options_common_tasks();
    });

  d3.select('#representation-circle')
    .on('click', function(d) {
      config.representation.circle = !config.representation.circle;
      options_common_tasks();
    });

  d3.select('#representation-particle')
    .on('click', function(d) {
      config.representation.particle = !config.representation.particle;
      options_common_tasks();
    });

  function options_common_tasks() {
    configure_details_panel();
  }


  ////////// Details \\\\\\\\\\

  d3.select("#top-countries-toggle")
    .on('click', function(){
      var label = d3.select('#top-countries-label');
      if (label.text().indexOf('Sources') != -1) {
        config.top = 'destinations';
        label.html('Top Destinations');
        top5(migration.destination);
      } else {
        config.top = 'sources';
        label.html('Top Sources');
        top5(migration.source);
      }
    });


  ////////// Tweets \\\\\\\\\\

  d3.select(".rightpane")
    .on("mouseenter", function() {
      can_update_tweet_list = false
    })
    .on("mouseleave", function() {
      can_update_tweet_list = true;
      display_buffered_tweets();
    });



  //
  // Utils
  //

  // Main menu

  function select_main_menu_active_item() {
    d3.select('.main-menu')
      .selectAll('a')
      .classed('active', false);
    d3.select('#' + mode)
      .classed('active', true);
  }

  function clear_details_panel() {
    clear_migration_data();
    display_total_migration_count();
    display_top5_countries();
  }

  function clear_migration_data() {
    tmp_migration = migration;
    migration = {
      count: 0,
      source: {},
      destination: {}
    }
  }

  function configure_details_panel() {
    d3.select('#details')
      .classed('invisible', mode == 'statistics');

    d3.select('#options')
      .classed('invisible', mode == 'statistics');

    d3.select('#menu-date')
      .classed('invisible', mode != 'historical');

    d3.select('#menu-slider')
      .classed('invisible', mode != 'historical');

    d3.select('#menu-representation')
      .classed('invisible', mode == 'statistics');

    d3.select('#representation-arc')
      .classed('active', config.representation.arc);

    d3.select('#representation-circle')
      .classed('active', config.representation.circle);

    d3.select('#representation-particle')
      .classed('active', config.representation.particle);

    d3.select('#menu-projection')
      .classed('invisible', mode == 'statistics');

    d3.select('#projection-globe')
      .classed('active', config.projection == 'globe');

    d3.select('#projection-flat')
      .classed('active', config.projection != 'globe');

    d3.select('#representation-arc')
      .classed('active', config.representation.arc);

    d3.select('#representation-circle')
      .classed('active', config.representation.circle);

    d3.select('#representation-particle')
      .classed('active', config.representation.particle);

    d3.select('#menu-autorotation')
      .classed('invisible', mode == 'statistics');

    d3.select('#autorotation-on')
      .classed('active', config.autorotation);

    d3.select('#autorotation-off')
      .classed('active', !config.autorotation);
  }

  function configure_options_panel() {
    d3.select('.main-menu')
      .classed('active', false);
  }

  function clear_tweet_buffer() {
    tweet_list_buffer = [];
  }

  function clear_tweet_panel() {
    d3.select('#tweets')
      .selectAll('*')
      .remove();
  }

  function switch_canvases() {
    d3.select('#worldCanvas')
    .classed('invisible', mode == 'statistics');
        d3.select('#chart')
    .classed('invisible', mode != 'statistics');
  }

  function initialize_interval_picker() {
    d3.select('#intervalpicker-wrap')
      .classed('invisible', !(mode == 'historical' || mode == 'statistics'));

     d3.select('#interval_submit')
      .on('click', function() {
        d3.select('#intervalpicker-wrap')
          .classed('invisible', true);

        var interval_from = moment($('#interval_from').val(), "DD/MM/YYYY").valueOf();
        var interval_to = moment($('#interval_to').val(), "DD/MM/YYYY").valueOf();

        if (mode == 'historical') {
          historical_mode(interval_from, interval_to)
        } else if (mode == 'statistics') {
          statistics_mode(interval_from, interval_to);
        }
      });
  }

  function initialize_current_mode() {
    if (historical_timer !== undefined)
      historical_timer.stop();

    if (mode == 'live') {
      live_mode();
    } else if (mode == 'historical') {
      // historical_mode();
    } else if (mode == 'statistics') {
      // statistics_mode();
    } else if (mode == 'tour') {
      tour_mode();
    }
  }

  function top5(dict){
    var items = Object.keys(dict).map(function(key) {
        return [key, dict[key]];
    });

    items.sort(function(first, second) {
        return second[1] - first[1];
    });


    return items.slice(0, 5);
  }

  function percent(portion, total) {
    return ((portion / total) * 100).toFixed(2);
  }

  function live_mode() {
    var socket = new SockJS(data_source.live);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
      console.log('Connected: ' + frame);
      stompClient.subscribe('/topic/tweets', function (message) {
          tweet = JSON.parse(message.body);
          console.log(tweet);
          display_tweet(tweet);
      });
    });
  }

  function historical_mode(interval_from, interval_to) {
    d3.json(
      data_source.historical
        .replace('{from}', interval_from)
        .replace('{to}', interval_to),
      function(err, data) {
        if (err)
          return;

        console.log(data.length);

        var start = parseInt(data[0].timestamp, 10);
        var end = parseInt(data[data.length - 1].timestamp, 10);
        var currentTime = start;
        var lastTick = new Date().getTime();
        var paused = false;

        var updateDate = function() {
          d3.select('#date')
            .text(moment(currentTime).utc().format("MMM DD YYYY HH:mm UTC"));
        };

        // A scale that maps a percentage of playback to a time from the data;
        // for example, `50` would map to the halfway mark between the first
        // and last items in our data array.
        var percentToDate = function () {
          return d3.scale.linear()
            .domain([0, 100])
            .range([start, end]);
        }

        // A scale that maps real time passage to data playback time.
        // 10 minutes of real time maps to the entirety of the timespan covered by the data.
        var realToData = function (value) {
          return d3.scale
            .linear()
            .domain([0, 1000 * 60 * config.playback.speed])
            .range([0, end - start])(value);
        }

        // Pause playback and update the time display while scrubbing using the range input.
        d3.select('#slider')
          .on('change', function(d) {
            currentTime = percentToDate()(d3.event.target.value);
            updateDate();
          })
          .call(d3.behavior
            .drag()
            .on('dragstart', function() {
              paused = true;
            })
            .on('dragend', function() {
              paused = false;
            })
          );

        d3.selectAll('i.pause.icon', 'i.play.icon')
          .on('click', function() {
            paused = !paused;
            handle_play_pause_icon();
          });

        function handle_play_pause_icon(){
            var icon = d3.selectAll('i.pause.icon', 'i.play.icon');
            icon.classed('pause', paused);
            icon.classed('play', !paused);
        }

        d3.select('i.fast.backward.icon')
          .on('click', function() {
            config.playback.speed *= 2;
            config.playback.speed_factor /= 2;
            d3.select('#speed-factor').html(config.playback.speed_factor + 'x');
          });

        d3.select('i.fast.forward.icon')
          .on('click', function() {
            config.playback.speed /= 2;
            config.playback.speed_factor *= 2;
            d3.select('#speed-factor').html(config.playback.speed_factor + 'x');
          });

        // The main playback loop; for each tick, we'll see how much time passed in our accelerated
        // playback reel and find all the tweets that happened in that timespan, adding them to the map.
        historical_timer = d3.timer(function() {
          var now = new Date().getTime();

          if (paused || mode != 'historical') {
            lastTick = now;
            return;
          }

          var realDelta = now - lastTick;

          // Avoid switching back to the window only to see thousands of migrations; if it's been more than
          // 500 milliseconds since we've updated playback, we'll just set the value to 500 milliseconds.
          if (realDelta > 500) {
            realDelta = 500;
          }

          var dataDelta = realToData(realDelta);

          var tweetsToDisplay = data.filter(function(d) {
            return d.timestamp > currentTime && d.timestamp <= currentTime + dataDelta;
          });

          for (var i = 0; i < tweetsToDisplay.length; i++) {
            display_tweet(tweetsToDisplay[i]);
          }

          currentTime += dataDelta;

          if (currentTime > end) {
            paused = true;
          }

          updateDate();

          d3.select('#slider')
            .property('value', percentToDate().invert(currentTime));

          lastTick = now;
        });
    });
  }

  function statistics_mode(interval_from, interval_to) {

    // d3.json(
    //   data_source.country_from.replace('{from}', interval_from).replace('{to}', interval_to),
    //   function(err, data) {
    //     console.log(data);
    //     tmp_migration.source = data;
    //   }
    // );

    // d3.json(
    //   data_source.country_to.replace('{from}', interval_from).replace('{to}', interval_to),
    //   function(err, data) {
    //     tmp_migration.destination = data;
    //   }
    // );

    // console.log(tmp_migration);


    var data = [];

    Object.keys(tmp_migration.source).forEach(function(key, index) {
      var s = tmp_migration.source[key];
      var d = tmp_migration.destination[key];
      data.push({
        Country: key,
        Departures: s,
        Arrivals: d,
        Median: d-s
      });
    });

    function getSortedKeys(obj) {
      var keys = [];
      for(var key in obj)
        keys.push(key);
      return keys.sort(function(a,b){
        return obj[b]-obj[a]
      });
    }

    var countries = getSortedKeys(tmp_migration.source);

    countries.map(function(item) {
      d3.select('#tweets')
        .insert('li')
        .html(item + "(" + percent(tmp_migration.source[item], tmp_migration.count) + "%)");
    })

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1160 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

    var x0 = d3.scale
      .ordinal()
      .rangeRoundBands([0, width], 0.1);

    var x1 = d3.scale
      .ordinal();

    var y = d3.scale
      .linear()
      .range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(x0)
      .orient("bottom");

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

    var color = d3.scale
      .ordinal()
      .range(["#ff706b", "#87d6af", "#ffcc5e"]);

    var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yBegin;

    var innerColumns = {
    "column1" : ["Departures"],
    "column2" : ["Arrivals"],
    "column3" : ["Median"]
    }

    // d3.csv("data.csv", function(error, data) {
      console.log(data);
      var columnHeaders = d3.keys(data[0])
        .filter(function(key) { return key !== "Country"; });

      color.domain(d3.keys(data[0])
        .filter(function(key) { return key !== "Country"; }));

      data.forEach(function(d) {
        var yColumn = new Array();

        d.columnDetails = columnHeaders.map(function(name) {
          for (ic in innerColumns) {
            if($.inArray(name, innerColumns[ic]) >= 0){
              if (!yColumn[ic]){
                yColumn[ic] = 0;
              }
              yBegin = yColumn[ic];
              yColumn[ic] += +d[name];

              return {name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin,};
            }
          }
        });

        d.total = d3.max(d.columnDetails, function(d) {
          return d.yEnd;
        });
      });

      x0.domain(data.map(function(d) {
        return d.Country;
      }));

      x1.domain(d3.keys(innerColumns))
        .rangeRoundBands([0, x0.rangeBand()]);

      y.domain([0, d3.max(data, function(d) {
        return d.total;
      })]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".7em")
        .style("text-anchor", "end")
        .text("");

      var project_stackedbar = svg.selectAll(".project_stackedbar")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
          return "translate(" + x0(d.Country) + ",0)";
        });

      project_stackedbar.selectAll("rect")
        .data(function(d) {
          return d.columnDetails;
        })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) {
          return x1(d.column);
        })
        .attr("y", function(d) {
          return y(d.yEnd);
        })
        .attr("height", function(d) {
          return y(d.yBegin) - y(d.yEnd);
        })
        .style("fill", function(d) {
          return color(d.name);
        });

      var legend = svg.selectAll(".legend")
        .data(columnHeaders.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          return "translate(0," + i * 20 + ")";
        });

      legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
          return d;
        });

    // });
  }

  function tour_mode() {
    tour.init();
    tour.start();
  }


  //
  // Display
  //

  function add_tweet_to_list(tweet) {
    d3.select('#tweets')
        .insert('li', ':first-child')
        .html(function(d) {
          var date = moment(tweet.timestamp).utc().format("MMM DD")
          return "<div class='tweet'>" +
            "<div class='avatar'>" +
            "  <img src='img/default_profile.png' width='40px'/><br/>" +
            "  <img src='img/flags/" + tweet.source.country_code + ".png' title='" + tweet.source.country +"'width='13px'/>" +
            "  - " +
            "  <img src='img/flags/" + tweet.destination.country_code + ".png' title='" + tweet.destination.country + "' width='13px'/>" +
            "</div>"+
            "<div class='content'>"+
              "<b>" + tweet.name + "</b> " +
              "<span>@" + tweet.username + " " + date + "</span><br/>" +
              tweet.tweet +
            "</div>" +
            "<div style='clear: both'></div>" +
          "</div>";
        });
  }

  function display_buffered_tweets() {
    var tmp = tweet_list_buffer
    for (var i = 0; i < tmp.length; i++) {
      add_tweet_to_list(tmp[i]);
      tweet_list_buffer.splice(tweet_list_buffer.indexOf(tmp[i]), 1);
    }
  }

  function display_total_migration_count() {
    d3.select('#total-migration')
      .html(migration.count);
  }

  function display_top5_countries() {
    var countries = top5(config.top == 'sources' ? migration.source : migration.destination);

    d3.select('#top-countries')
      .selectAll('li')
      .remove();

    countries.map(function(item) {
      d3.select('#top-countries')
        .insert('li')
        .html(item[0] + " (" + percent(item[1], migration.count) + "%)");
    })
  }

  function display_tweet(tweet) {
    migration.count += 1;

    migration.source[tweet.source.country] =
      migration.source[tweet.source.country] === undefined ? 1 : migration.source[tweet.source.country]+1;

    migration.destination[tweet.destination.country] =
      migration.destination[tweet.destination.country] === undefined ? 1 : migration.destination[tweet.destination.country]+1;

    display_total_migration_count();
    display_top5_countries();


    if (can_update_tweet_list) {
      add_tweet_to_list(tweet);
    } else {
      tweet_list_buffer.push(tweet);
    }

    if (config.representation.arc) {
      planet.plugins.lines.add(
        tweet.source.longitude,
        tweet.source.latitude,
        tweet.destination.longitude,
        tweet.destination.latitude,
        {
          color: 'yellow',
          ttl: 2000
        }
      );
    }

    if (config.representation.circle) {
      planet.plugins.pings.add(
        tweet.source.longitude,
        tweet.source.latitude,
        {
          color: 'red',
          ttl: 2000
        }
      );

      planet.plugins.pings.add(
        tweet.destination.longitude,
        tweet.destination.latitude,
        {
          color: 'green',
          ttl: 2000
        }
      );
    }

    if (config.representation.particle) {
      planet.plugins.particles.add(
        tweet.source.longitude,
        tweet.source.latitude,
        tweet.destination.longitude,
        tweet.destination.latitude,
        {
          color: 'yellow',
          ttl: 2000
        }
      );
    }
  }


  //
  // Initialize
  //

  navigation_common_tasks()




  //
  // Plugins
  //

  // Plugin to resize the canvas to fill the window and to
  // automatically center the planet when the window size changes
  function autocenter(options) {
    options = options || {};
    var needsCentering = false;
    var globe = null;

    var resize = function() {
      var width  = window.innerWidth + (options.extraWidth || 0);
      var height = window.innerHeight + (options.extraHeight || 0);
      globe.canvas.width = width;
      globe.canvas.height = height;
      globe.projection.translate([width / 2, height / 2]);
    };

    return function(planet) {
      globe = planet;
      planet.onInit(function() {
        needsCentering = true;
        d3.select(window).on('resize', function() {
          needsCentering = true;
        });
      });

      planet.onDraw(function() {
        if (needsCentering) { resize(); needsCentering = false; }
      });
    };
  };

  // Plugin to automatically scale the planet's projection based
  // on the window size when the planet is initialized
  function autoscale(options) {
    options = options || {};
    return function(planet) {
      planet.onInit(function() {
        var width  = window.innerWidth + (options.extraWidth || 0);
        var height = window.innerHeight + (options.extraHeight || 0);
        planet.projection.scale(Math.min(width, height) / 2);
      });
    };
  };

  // Plugin to automatically rotate the globe around its vertical
  // axis a configured number of degrees every second.
  function autorotate(degPerSec) {
    return function(planet) {
      var lastTick = null;
      var paused = false;
      planet.plugins.autorotate = {
        pause:  function() { paused = true;  },
        resume: function() { paused = false; }
      };
      planet.onDraw(function() {
        if (paused || !lastTick) {
          lastTick = new Date();
        } else {
          var now = new Date();
          var delta = now - lastTick;
          var rotation = planet.projection.rotate();
          rotation[0] += degPerSec * delta / 1000;
          if (rotation[0] >= 180) rotation[0] -= 360;
          planet.projection.rotate(rotation);
          lastTick = now;
        }
      });
    };
  };



function midpoint(lat1, long1, lat2, long2, per) {
  // d3.interpolateObject([47.1561373,27.5869704], [51.5285578,-0.2420216])(0.1);
  return d3.interpolateObject([lat1,long1], [lat2,long2])(per/100);
     // return [lat1 + (lat2 - lat1) * per, long1 + (long2 - long1) * per];
}

  // Plugin to connect two geographical points with a line
  function lines(config) {
    var lines = [];
    config = config || {};

    var addLine = function(slng, slat, dlng, dlat, options) {
      options = options || {};
      options.color = options.color || config.color || 'white';
      options.ttl   = options.ttl   || config.ttl   || 2000;
      var line = { time: new Date(), options: options };
        line.slat = slng;
        line.slng = slat;
        line.dlat = dlng;
        line.dlng = dlat;
      lines.push(line);
    };

    var drawLines = function(planet, context, now) {
      var newLines = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var alive = now - line.time;
        if (alive < line.options.ttl) {
          newLines.push(line);
          drawLine(planet, context, now, alive, line);
        }
      }
      lines = newLines;
    };

    var drawLine = function(planet, context, now, alive, line) {
      var alpha = 1 - (alive / line.options.ttl);
      var color = d3.rgb(line.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";

      var gradient = context.createLinearGradient(line.slat, line.dlat, line.slng, line.dlng);
      gradient.addColorStop(1, "green");
      gradient.addColorStop(1, "red");

      var m = midpoint(line.slat, line.slng, line.dlat, line.dlng, percent(alive, line.options.ttl));

      var line = {type: "LineString", coordinates: [[line.slat, line.slng], m]}

      context.strokeStyle = color;
      context.beginPath();
      planet.path.context(context)(line);
      context.stroke();
    };

    return function (planet) {
      planet.plugins.lines = {
        add: addLine
      };

      planet.onDraw(function() {
        var now = new Date();
        planet.withSavedContext(function(context) {
          drawLines(planet, context, now);
        });
      });
    };
  };















  // Plugin to connect two geographical points with a particle.
  function particles(config) {
    var particles = [];
    config = config || {};

    var addParticle = function(slat, slng, dlat, dlng, options) {
      options       = options || {};
      options.color = options.color || config.color || 'white';
      options.ttl   = options.ttl   || config.ttl   || 2000;

      var particle  = {
        time: new Date(),
        options: options,
        source: {
          lat: slat,
          lng: slng
        },
        destination : {
          lat: dlat,
          lng: dlng
        }
      };

      particles.push(particle);
    };

    var drawParticles = function(planet, context, now) {
      var newParticles = [];

      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var alive = now - particle.time;

        if (alive < particle.options.ttl) {
          newParticles.push(particle);
          drawParticle(planet, context, now, alive, particle);
        }
      }

      particles = newParticles;
    };

    var drawParticle = function(planet, context, now, alive, particle) {
      var percent = alive / particle.options.ttl;
      var alpha = 1 - percent;

      var color = d3.rgb(particle.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";

      var particle = d3.geo
        .circle()
        .origin(calculateMidpoint(particle, percent))
        .angle(0.3)()

      context.fillStyle = color;
      context.beginPath();
      planet.path.context(context)(particle);
      context.fill();
    };

    var calculateMidpoint = function(particle, percent) {
      return d3.interpolateObject(
        [particle.source.lat, particle.source.lng],
        [particle.destination.lat, particle.destination.lng]
      )(percent);
    };

    return function (planet) {
      planet.plugins.particles = {
        add: addParticle
      };

      planet.onDraw(function() {
        var now = new Date();
        planet.withSavedContext(function(context) {
          drawParticles(planet, context, now);
        });
      });
    };
  };


})();
