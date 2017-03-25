// Sebastiaan Hoekstra stnr 10264523 

// Partially adapted from:
// Steve Hollasch http://bl.ocks.org/hollasch/12e6627b4a8d7c3ceaac5297fa1d3169
// Chris Khoo// http://bl.ocks.org/khoomeister/230e1eff08ee8d6eaf35
// KoGor http://bl.ocks.org/KoGor/5685876

d3.map = function mapModule(low,high) {
	"use strict";
	
	d3.select("svg").remove();
	d3.select("#countryname").remove();
	
	var mapDiv = d3.select('#map');
	var width  = mapDiv.node().getBoundingClientRect().width; //800
	var height = mapDiv.node().getBoundingClientRect().height; //505;
	var plotCenter = [ width/2, height/2 + 100 ];

	var initialLongitude = 0;            // Initial longitude to center
	var latitudeBounds = [ -80, 84 ];      // Maximum latitude to display
		
	var projection = d3.geo.mercator()
		.rotate([-initialLongitude, 0])    // Rotate the initial longitude to center
		.scale(1)                          // We'll scale up to match the viewport shortly
		.translate(plotCenter);

	var viewMin = [ 0, 0 ];
	var viewMax = [ 0, 0 ];

	var color_domain = [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5];
	var ext_color_domain = [-3,-2,-1,0,1,2,3]
	var legend_labels = ["< -3", "-2+", "-1+", "0+", "1+", "2+", "> 3"]
	var color = d3.scale.threshold()
		.domain(color_domain)
		.range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);
	
	//Reading map file and data

	queue()
	  .defer(d3.json, "static/world_map/world-110m2.json")
	  .defer(d3.tsv, "static/world_map/world-country-names.tsv")
	  .defer(d3.json, "temp_comparison/".concat(low).concat("/").concat(high))
	  //.defer(d3.csv, "static/world_map/Temperatures.csv")
	  .await(ready);

	//Start of Choropleth drawing

	function ready(error, world, countryNames, tempData) {
		if (error) throw error;
		  
		var tempById = {};
		var nameById = {};

		countryNames.forEach(function(d){
			nameById[d.id] = d.name;
		});
		
		tempData.forEach(function(d) {
			tempById[d.iso_code] = +d.temp_increase;
		 });
		 console.log(tempById['nl']);
		
		//tempData.forEach(function(d) {
		//	tempById[d.RegionCode] = d.Temperature;
		//	});	
			
		let countries = topojson.feature(world, world.objects.countries).features;

		countries = countries.filter(function(d) {
			return countryNames.some(function(n) {
				if (d.id == n.id) return d.name = n.name, d.iso_code = n.iso_code
			})
		})			
			
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

		var zoom = d3.behavior.zoom()       // Set up zoom
			.size([width,height])
			.scaleExtent(scaleExtent)
			.scale(projection.scale())
			.on("zoom", handlePanZoom);

		svg.call(zoom);                     // Attach zoom event
		
		// Load map data
		map.selectAll('.country')
		.data(countries)
		.enter()
		.append('path')
		.attr('class', 'country')
		.attr({
			'data-name': function(d) {
			  return d.name
			},
			'data-iso': function(d) {
			  return d.iso_code
			},
			'data-x-centroid': function(d) {
			  return path.centroid(d)[0]
			},
			'data-y-bottom': function(d) {
			  return path.bounds(d)[1][1]
			}
		})
		.attr('d', path)
		.style("fill", function(d) {
				return color(tempById[nameById[d.id].toString().concat('2017')]);
			})
		.on('mousedown', function() {
			let country = d3.select(this).style('stroke-width', '3px').style('stroke', 'white')
			let countryName = country.attr('data-name')
			textpos.text(countryName)
			let iso = country.attr('data-iso')
			currentCountryName = countryName;
			currentCountryISO = iso;
		  if (navAnnual) {
			  switchToChart();
		  };	
		  if (navMonthly) {
			  switchToHeatmap();
		  };	
		})
		.on('mouseup', function() {
			let country = d3.select(this).style('stroke-width', '.5px').style('stroke', '#666')
		})
		
		let textpos = d3.select('#sidenav')
		.append('div')
		.append('text')
		.attr('id', 'countryname')
		.attr('font-family', 'Verdana')
		.attr('font-size', '15px')
		.attr('margin','0px 5px 0px 0px')
		.attr('padding', '3px 5px');
		
		textpos.text(currentCountryName);
		
		  //Adding legend

		  var legend = svg.selectAll("g.legend")
		  .data(ext_color_domain)
		  .enter().append("g")
		  .attr("class", "legend");

		  var ls_w = 20, ls_h = 20;

		  legend.append("rect")
		  .attr("x", 20)
		  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
		  .attr("width", ls_w)
		  .attr("height", ls_h)
		  .style("fill", function(d, i) { return color(d); })
		  .style("opacity", 0.8);

		  legend.append("text")
		  .attr("x", 50)
		  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
		  .text(function(d, i){ return legend_labels[i]; });
		
		render();
		
		// The following variables track the last processed event.
		var translateLast = [0,0];
		var scaleLast     = null;

		function render() {
			map.selectAll('path')       // Redraw all map paths
				.attr('d', path)
				.style("fill", function(d) {
				return color(tempById[d.iso_code]); 
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