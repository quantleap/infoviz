// Dion Oosterman

// Partially adapted from http://bl.ocks.org/mbostock/3887118 and http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

d3.bubblechart = function bubbleModule(year_low, year_high) {
	"use strict";
	
	d3.select("#map").selectAll("*").remove();
	
	var margin = {top: 20, right: 20, bottom: 30, left: 40};
	var mapDiv = d3.select('#map');
	var width  = mapDiv.node().getBoundingClientRect().width
	- margin.left - margin.right; //800
	var height = mapDiv.node().getBoundingClientRect().height
	-  margin.top - margin.bottom; //505;


	// TO DO: add list of countries to obtain data for --> top 5 countries highest emission, top 5 countries highest temp increase
	// TO DO: add (dynamic) data read in from slider ('yearmin', 'yearmax')
	/*
	var data = {};
	var countries = ['nl', 'gb', 'us', 'bd', 'au', 'sd', 'ru', 'no']
	for (var i=0; i<countries.length; i++) {
		var country_id = countries[i];
		data[country_id] = {'temperature':undefined,
							'co2':undefined
						};
		data[country_id].temperature = i;  // TO DO: make difference between 'year_high' and 'year_low'
		data[country_id].co2 = i*1000;  // TO DO: make sum from 'year_low' to 'year_high'
	}
	console.log(data.gb);
	*/

// EXAMPLE URL: http://127.0.0.1:5000/country/nl/annual_temperatures?begin=1975&end=2017
	function getTemp(country_id, year_low, year_high) {
    	// code to be executed
    	var url = 'country/'.concat(country_id).concat('/annual_temperatures')
				 .concat('?begin=').concat(year_low).concat('&end=').concat(year_high);
		d3.json(url, function (json) {
			var temp_max = json.temperatures.slice(0)[0].avg_temp;  // first index (most recent year)
			var temp_min = json.temperatures.slice(-1)[0].avg_temp;  // last index (oldest year)
		});

		return (temp_max - temp_min);
	};

// EXAMPLE URL: http://127.0.0.1:5000/country/nl/indicators?begin=1975&end=2017
	function getCO2(country_id, year_low, year_high) {
		// code to be executed
		var url = 'country/'.concat(country_id).concat('/indicators')
				 .concat('?begin=').concat(year_low).concat('&end=').concat(year_high);
		d3.json(url, function (json) {
			// for (var i=0; i<json.indicators.length; i++) {
			// TO DO: sum CO2 emissions
			// var emission = json.indicators.[0].co2_emission_total;  // emission in one year
			// };
		});

		// return co2_total;
	};
	

	var country_id = 'nl';
	// query temperature data from database FOR A SINGLE COUNTRY
	var url = 'country/'.concat(country_id).concat('/annual_temperatures')
				 .concat('?begin=').concat(year_low).concat('&end=').concat(year_high);
	d3.json(url, function (json) {
		// console.log(url);
		console.log(json.temperatures.slice(0)[0].avg_temp);  // first index (most recent year)
		console.log(json.temperatures.slice(-1)[0].avg_temp);  // last index (oldest year)
	});

	/* 
	 * value accessor - returns the value to encode for a given data object.
	 * scale - maps value to a visual display encoding, such as a pixel position.
	 * map function - maps from data value to display value
	 * axis - sets up axis
	 */ 

	// TO DO: make scale logarithmic?
	// setup x 
	var xValue = function(d) { return d.emission;}, // data -> value
		xScale = d3.scale.linear().range([0, width]), // value -> display
		xMap = function(d) { return xScale(xValue(d));}, // data -> display
		xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(7, ",.1s").tickSize(6, 0);

	// setup y
	var yValue = function(d) { return d.temperature;}, // data -> value
		yScale = d3.scale.linear().range([height, 0]), // value -> display
		yMap = function(d) { return yScale(yValue(d));}, // data -> display
		yAxis = d3.svg.axis().scale(yScale).orient("left");

	// setup fill color
	var cValue = function(d) { return d.year;},
		color = d3.scale.category10();

	// add the graph canvas to the body of the webpage
	var svg = mapDiv.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add the tooltip area to the webpage
	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);


	// load data
	d3.csv("static/bubble_chart/fake_data.csv", function(error, data) {
	  // change string (from CSV) into number format
	  data.forEach(function(d) {
		d.temperature = +d.temperature;
		d.emission = +d.emission;
	   // console.log(d);
	  });


	  // Determine bubble radius domain max
	  var max_r = 0;
	  var new_r;
	  data.forEach(function(d) {
		new_r = d.emission/(d.population/100000);
		if (new_r > max_r) {
		  max_r = new_r
		};
	  });
	  // console.log(max_r);

	  // Set bubble radius range
	  var rScale = d3.scale.linear()
		.domain([0,max_r])
		.range([7.5,25]);


	  // don't want dots overlapping axis, so add in buffer to data domain
	  // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
	  // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
	  xScale.domain([d3.min(data, xValue)-20, d3.max(data, xValue)+20+50]); // where '20' is the max of the range in rScale, 50 is for legend
	  yScale.domain([d3.min(data, yValue)-0.2, d3.max(data, yValue)+0.2]);

	  // x-axis
	  svg.append("g")
		  .attr("class", "x axis")
		  // .attr("transform", "translate(0," + height + ")")  // bottom position
		  .attr("transform", "translate(0," + yScale(0) + ")")  // zero-line position
		  .call(xAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("x", width)
		  .attr("y", -6)
		  .style("text-anchor", "end")
		  .text("Emissions (Kiloton)");

	  // y-axis
	  svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  // .text("Temperature change (10 years)");  // TO DO: make 'years' dynamic
		  .text("Temperature change (" + year_low + " - " + year_high + ")");  // TO DO: make 'years' dynamic


	  // draw dots
	  svg.selectAll(".dot")
		  .data(data)
		.enter().append("circle")
		  .attr("class", "dot")
		  // .attr("r", 3.5)
		  .attr("r", function(d) { return rScale(d.emission/(d.population/100000));})  // Depends on how emission data and population is represented
		  .attr("cx", xMap)
		  .attr("cy", yMap)
		  .attr('fill-opacity', 0.6) ////////// TO DO: tweak value!
		  // .style("fill", function(d) { return color(cValue(d.country));}) 
		  .style("fill", function(d) { return color(d.country);}) 
		  .on("mouseover", function(d) {
			  tooltip.transition()
				   .duration(200)
				   .style("opacity", .9);
			  tooltip.html(d.country + "<br/> (" + xValue(d) 
				+ ", " + yValue(d) + ")")
				   .style("left", (d3.event.pageX + 5) + "px")
				   .style("top", (d3.event.pageY - 28) + "px");
		  })
		  .on("mouseout", function(d) {
			  tooltip.transition()
				   .duration(500)
				   .style("opacity", 0);
		  });



	var legendSize = [max_r, max_r/2, max_r/4, max_r/16];
	var legendTopPadding = 30;
	var legendPadding = 8;

	  // draw legend
	  var legend = svg.selectAll(".legend")
		  .data(legendSize)
		.enter().append("g")
		  .attr("class", "legend")
		  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	  // draw legend sized bubbles
	  legend.append("circle")
		  .attr("cx", width - 18)
		  .attr("cy", function(d,i) {return (legendTopPadding + (rScale(d)+legendPadding)*i);})
		  .attr("r", function(d) { return rScale(d);})
		  .style("stroke", "black")
		  .style("fill", "none");

	  // draw legend text
	  legend.append("text")
		  // .attr("x", width - 24)
		  .attr("x", function(d) {return (width - (24+rScale(d)));})
		  // .attr("y", 9)
		  .attr("y", function(d,i) {return (legendTopPadding + (rScale(d)+legendPadding)*i);})
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d) {return d;})

		//create legend title 
		svg.append("text")
		.attr("x", width - 18)
		.attr("y", 0)
		// .style("text-anchor", "middle")
		.style("text-anchor", "end")
		// .text("Per capita CO2 emission:");


	});
	
}