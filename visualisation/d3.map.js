// Sebastiaan Hoekstra stnr 10264523 

// Map adapted from Steve Hollasch http://bl.ocks.org/hollasch/12e6627b4a8d7c3ceaac5297fa1d3169
// Map interaction adapted from KoGor http://bl.ocks.org/KoGor/5685876

d3.map = function module(year) {
	"use strict";

	d3.select("svg").remove();
	
	var mapDiv = d3.select('#map');
	var width  = mapDiv.node().getBoundingClientRect().width; //800
	var height = 500; // 0.4 * width
	var plotCenter = [ width/2, height/2 + 100 ];

	var initialLongitude = 0;            // Initial longitude to center
	var latitudeBounds = [ -80, 84 ];      // Maximum latitude to display
		
	var projection = d3.geo.mercator()
		.rotate([-initialLongitude, 0])    // Rotate the initial longitude to center
		.scale(1)                          // We'll scale up to match the viewport shortly
		.translate(plotCenter);

	var viewMin = [ 0, 0 ];
	var viewMax = [ 0, 0 ];

	var color_domain = [0, 10, 20, 30, 40]
	var ext_color_domain = [0, 50, 150, 350, 750, 1500]	
	var color = d3.scale.threshold()
		.domain(color_domain)
		.range(["#adfcad", "#ffcb40", "#ffba00", "#ff7d73", "#ff4e40", "#ff1300"]);
		
	//var year = 2017;	
	console.log(year);
	
	//Reading map file and data

	queue()
	  .defer(d3.json, "world-topo.json")
	  .defer(d3.csv, "Temperatures.csv")
	  .await(ready);

	//Start of Choropleth drawing

	function ready(error, world, data) {
		var tempById = {};
		var nameById = {};

		data.forEach(function(d) {
			tempById[d.RegionCode] = +d.Temperature;
			nameById[d.RegionCode] = d.RegionName;
			});	
			

		function updateProjectionBounds() {
			// Updates the view top left and bottom right with the current projection.
			var yaw = projection.rotate()[0];
			var longitudeHalfRotation = 180.0 - 1e-6;

			viewMin = projection([-yaw - longitudeHalfRotation, latitudeBounds[1]]);
			viewMax = projection([-yaw + longitudeHalfRotation, latitudeBounds[0]]);
		}

		updateProjectionBounds();

		// Set up the scale extent and initial scale for the projection.
		var s = width / (viewMax[0] - viewMin[0]);
		var scaleExtent = [s, 50*s];        // The minimum and maximum zoom scales

		projection
			.scale(scaleExtent[0]);         // Set up projection to minimium zoom
			
		var path = d3.geo.path()            // Map Geometry
			.projection(projection);

		var svg = mapDiv.append('svg')      // Set up map SVG element
			.attr('width',width)
			.attr('height',height)

		var map = svg.append('g');          // Map Group

		svg.append("rect")
			.attr("class", "overlay")
			.attr("width", width)
			.attr("height", height);

		var zoom = d3.behavior.zoom()       // Set up zoom
			.size([width,height])
			.scaleExtent(scaleExtent)
			.scale(projection.scale())
			.on("zoom", handlePanZoom);

		svg.call(zoom);                     // Attach zoom event

		const colors = ['green', 'blue', 'red'];  

		// Load map data
		map.selectAll('path')
			.data(topojson.feature(world, world.objects.countries).features)
			.enter()
			.append('path')  
			.attr("d", path)
			.style("fill", function(d) {
				return color(tempById[d.properties.name.toString().concat(year.toString())]); 
			})
			.style("opacity", 0.8)
		
		render();
		
		// The following variables track the last processed event.
		var translateLast = [0,0];
		var scaleLast     = null;

		function render() {
			map.selectAll('path')       // Redraw all map paths
				.attr('d', path)
				.style("fill", function(d) {
				return color(tempById[d.properties.name.toString().concat(year.toString())]); 
			});
		}

		function handlePanZoom() {
			// Handle pan and zoom events

			var scale = zoom.scale();
			var translate = zoom.translate();
			
			// If the scaling changes, ignore translation (otherwise touch zooms are weird).
			var delta = [ translate[0] - translateLast[0], translate[1] - translateLast[1] ];
			if (scale != scaleLast) {
				projection.scale(scale);
			} else {
				var longitude = projection.rotate()[0];
				var tp = projection.translate();
			
				// Use the X translation to rotate, based on the current scale.
				longitude += 360 * (delta[0] / width) * (scaleExtent[0] / scale);
				projection.rotate ([longitude, 0, 0]);

				// Use the Y translation to translate projection, clamped by min/max
				updateProjectionBounds();

				if (viewMin[1] + delta[1] > 0)
					delta[1] = -viewMin[1];
				else if (viewMax[1] + delta[1] < height)
					delta[1] = height - viewMax[1];

				projection.translate ([ tp[0], tp[1] + delta[1] ]);
			}

			// Store the last transform values. NOTE: Resetting zoom.translate() and zoom.scale()
			// would seem equivalent, but it doesn't seem to work reliably.
			scaleLast = scale;
			translateLast = translate;

			render();
		};
	};

};

