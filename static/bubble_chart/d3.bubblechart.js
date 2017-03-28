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


	// reading in data
	queue()
	  .defer(d3.json, "temp_comparison/".concat(year_low).concat("/").concat(year_high))
	  .defer(d3.json, "co2_comparison/".concat(year_low).concat("/").concat(year_high))
	  .await(ready);

	function ready(error, tempData, co2Data) {
		if (error) throw error;

		// G8 + China (highest GDP in 2016 https://www.cia.gov/library/publications/the-world-factbook/rankorder/2001rank.html)
		// var countries = ["us", "cn", "fr", "de", "it", "ca", "jp", "gb", "ru"];
		// var country_names = ["United States", "China", "France", "Germany", "Germany", "Italy", "Canada", "Japan", "United Kingdom", "Russian Federation"];
		// G20
		var countries = ["ar", "au", "br", "ca", "cn", "fr", "de", "in", "id", "it", "jp", "kr", "mx", "ru", "sa", "za", "tr", "gb", "us"];
		var country_names = ["Argentina", "Australia", "Brazil", "Canada", "China", "France", "Germany", "India", "Indonesia", "Italy", "Japan", "South Korea", "Mexico", "Russia", "Saudi Arabia", "South Africa", "Turkey", "United Kingdom", "United States"];
		var temps = {};
		var co2 = {};
		var co2_percap = {};

		// console.log(tempData[0]);

		tempData.forEach(function(d) {
			if (countries.indexOf(d.iso_code) != -1) {
				temps[d.iso_code] = +d.temp_increase;
			};
		 });

		co2Data.forEach(function(d) {
			if (countries.indexOf(d.iso_code) != -1) {
				co2[d.iso_code] = +d.period_co2_emission;
				co2_percap[d.iso_code] = +(co2[d.iso_code] / d.population_end_year);
			};
		});

		var dataset = [];
		for (var i = 0; i<countries.length; i++) {
			if (+co2[countries[i]] > 0) {  // Only take countries that have actual CO2 emission data
				dataset.push( {
					iso_code: countries[i],
					country_name: country_names[i],
					temp: +temps[countries[i]],
					co2: +co2[countries[i]],
					co2_percap: +co2_percap[countries[i]]
				});
			}
		};

		// console.log(dataset);
		// console.log(countries);
		// console.log(co2);
		// console.log(co2_percap);


	// setup x 
	var xValue = function(d) { return d.co2;}, // data -> value
		// xScale = d3.scale.linear().range([0, width]), // value -> display
		xScale = d3.scale.log().base(Math.E).range([35, width-100]),
		xMap = function(d) { return xScale(xValue(d));}, // data -> display
		xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(7, ",.1s").tickSize(6, 0);


	// setup y
	var yValue = function(d) { return d.temp;}, // data -> value
		yScale = d3.scale.linear().range([height, 0]), // value -> display
		yMap = function(d) { return yScale(yValue(d));}, // data -> display
		yAxis = d3.svg.axis().scale(yScale).orient("left");

	// setup fill color
	var cValue = function(d) { return d.iso_code;},
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


  // Determine bubble radius domain max
  var radius = 0;
  dataset.forEach(function(d) {
	if (d.co2_percap > radius) {
	  radius = d.co2_percap;
	};
  });
  // console.log(radius);

  // Set bubble radius range
  var rScale = d3.scale.linear()
	.domain([0,radius])
	.range([7.5,25]);


  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(dataset, xValue)-1, d3.max(dataset, xValue)+1]);
  yScale.domain([d3.min(dataset, yValue)-1, d3.max(dataset, yValue)+1]);
  // xScale.domain([d3.min(dataset, xValue)-20, d3.max(dataset, xValue)+20+50]); // where '20' is the max of the range in rScale, 50 is for legend
  // yScale.domain([d3.min(dataset, yValue)-0.2, d3.max(dataset, yValue)+0.2]);

  // x-axis
  svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")  // bottom position
	  // .attr("transform", "translate(0," + yScale(0) + ")")  // zero-line position
	  .call(xAxis)
	.append("text")
	  .attr("class", "label")
	  .attr("x", width)
	  .attr("y", -6)
	  .style("text-anchor", "end")
	  .text("Country total CO2 emission (ton)")

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
	  // .text("Temperature change " + year_low + " - " + year_high + " (°Celsius)");
	  .text("Temperature change (°Celsius)");



  // draw dots
  svg.selectAll(".dot")
	  .data(dataset)
	.enter().append("circle")
	  .attr("class", "dot")
	  // .attr("r", 3.5)
	  // .attr("r", function(d) { return rScale(d.emission/(d.population/100000));})  // Depends on how emission data and population is represented
	  .attr("r", function(d) { return rScale(d.co2_percap);})
	  .attr("cx", xMap)
	  .attr("cy", yMap)
	  .attr('fill-opacity', 0.6) ////////// TO DO: tweak value!
	  .style("fill", function(d) { return color(d.iso_code);}) 
	  .on("mouseover", function(d) {
		  tooltip.transition()
			   .duration(200)
			   .style("opacity", .9);
	   	// tooltip.html(d.country_name + "<br/> (" + parseInt(xValue(d))
	   	tooltip.html(d.country_name + "<br/> (" + parseInt(xValue(d)).toLocaleString()
			+ ", " + Number(Math.round(yValue(d)+'e2')+'e-2') + ")")
			   .style("left", (d3.event.pageX + 5) + "px")
			   .style("top", (d3.event.pageY - 28) + "px");
	  })
	  .on("mouseout", function(d) {
		  tooltip.transition()
			   .duration(500)
			   .style("opacity", 0);
	  });


	var legendSize = [radius, radius/2, radius/4, radius/16];
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
	  // .text(function(d) {return d;})
	  .text(function(d) {return Number(Math.round(d+'e2')+'e-2');})

	//create legend title 
	svg.append("text")
	.attr("x", width - 18)
	.attr("y", 0)
	.style("text-anchor", "end")
	.text("Per capita CO2 emission (ton):");

	};
}