// Sebastiaan Hoekstra stnr 10264523 

// Linechart adapted from D3noob http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5

d3.linechart = function lineModule(position,title,url,id,type) {
	"use strict";
	
	//d3.select('#sideblock').selectAll("*").remove();
	if (position == "#row") {
		d3.select('#sideblock').selectAll('#abstemp').remove();}
	if (position == "#row2") {	
		d3.select('#sideblock').selectAll('#tempchangebar').remove();}
	d3.select('#sideblock').selectAll("#heatmap").remove();
	
	//Build the rows
	var data = [{ 'id' : 'row'},{ 'id' : 'row2'},{ 'id' : 'row3'}]
	var side = d3.select('#sideblock')
	.selectAll('div')
	.data(data).enter()
	.append('div')
		.attr('id', function (d) { return d.id; })
		.style('display', 'table-row')
		.style('height','155px')

	// Set the dimensions
	var margin = {top: 30, right: 20, bottom: 30, left: 30},
		width = 475 - margin.left - margin.right,
		height = 155 - margin.top - margin.bottom;

	// Parse the date
	var parseDate = d3.time.format("%Y").parse;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
		.orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
		.orient("left").ticks(5);

	// Define the line
	if (type == 'avg') {
		var valueline = d3.svg.line()
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.avg); })
			.defined(function(d) { return d.avg; }); }
	if (type == 'yoy') {
		var valueline = d3.svg.line()
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.yoy); })
			.defined(function(d) { return d.yoy; }); }			
		
	// Adds the svg canvas
	var svg = d3.select(position)
		.append("svg")
			.attr("id",id)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", 
				  "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	d3.json(url, function(error, data) {
		data.temperatures.forEach(function(d) {
			d.year = parseDate(d.year);
			d.avg = +d.avg_temp;
			d.yoy = +d.yoy_change_avg_temp;
		});

		// Scale the range of the data
		x.domain(d3.extent(data.temperatures, function(d) { 
		return d.year; }));
		if (type == 'avg') {
		y.domain([d3.min(data.temperatures, function(d) { 
		return d.avg; }), d3.max(data.temperatures, function(d) { 
		return d.avg; })]); }
		if (type == 'yoy') {
		y.domain([d3.min(data.temperatures, function(d) { 
		return d.yoy; }), d3.max(data.temperatures, function(d) { 
		return d.yoy; })]); }

		// Add the valueline path
		svg.append("path")
			.attr("class", "line")
			.attr("d", valueline(data.temperatures));
		
		// Add the title	
		svg.append("text")
			.attr("x", (width / 2))             
			.attr("y", 5 - (margin.top / 2))
			.attr("text-anchor", "middle")  
			.text(title);

		// Add the X Axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// Add the Y Axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

	});

};