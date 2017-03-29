// Sebastiaan Hoekstra stnr 10264523 

// barchart adapted from  Datafunk https://bl.ocks.org/datafunk/8a17b5f476a40a08ed17

d3.barchart = function barModule(position,title,url,id,type) {
	if (position == "#row2") {
	d3.select('#sideblock').selectAll('#tempchangebar').remove(); }
	if (position == "#row3") {
	d3.select('#sideblock').selectAll('#countrycomparison').remove(); } 
	d3.select('#sideblock').selectAll("#heatmap").remove();
		
	// Set the dimensions
	var margin = {top: 30, right: 20, bottom: 30, left: 30},
		width = 475 - margin.left - margin.right,
		height = 195 - margin.top - margin.bottom;
		
		
	var y = d3.scale.linear()
		.range([height, 0]);

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .05);

	var l,h;
	if (type == 'yoy') {
		l = low; h = high}
	if (type == 'cmp') {
		l = -3; h = 3}
		
	var xAxisScale = d3.scale.linear()
		.domain([l, h])
		.range([ 0, width]);

	if (type == 'yoy') {
	var xAxis = d3.svg.axis()
		.scale(xAxisScale)
		.orient("bottom")
		.ticks(5)
		.tickFormat(d3.format("d")); }
		
	if (type == 'cmp') {
	var xAxis = d3.svg.axis()
		.scale(xAxisScale)
		.orient("bottom")
		.ticks(5); }		

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(5);

	var svg = d3.select(position).append("svg")
		.attr("id",id)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	d3.json(url, function(error, data) {
		if (type == 'yoy') {
			var dat = data.temperatures;}
		if (type == 'cmp') {
			var dat = data.histogram;
			var dat2 = data}
		
		x.domain(dat.map(function(d) {
			if (type == 'yoy') {
				return d.year;}
			if (type == 'cmp') {
				return d.lbound;}
		}));
		y.domain(d3.extent(dat, function(d) {
			if (type == 'yoy') {
				return +d.yoy_change_avg_temp;}
			if (type == 'cmp') {
				return +d.count;}
		})).nice();	

		svg.selectAll(".bar")
			.data(dat)
			.enter().append("rect")
			.attr("class", function(d) {
				if (type == 'yoy') {
					if (d.yoy_change_avg_temp < 0){
						return "bar negative";
					} else {
						return "bar positive";
				} }
				if (type == 'cmp') {
					return "bar positive";}
			})
			.attr("data-yr", function(d){
				if (type == 'yoy') {
					return d.year;}
				if (type == 'cmp') {
					return d.lbound;}
			})
			.attr("data-c", function(d){
				if (type == 'yoy') {
					return d.yoy_change_avg_temp;}
				if (type == 'cmp') {
					return d.count;}				
				
			})
			.attr("y", function(d) {
				if (type == 'yoy') {
					if (d.yoy_change_avg_temp > 0){
						return y(d.yoy_change_avg_temp);
					} else {
						return y(0);
				} }
				if (type == 'cmp') {				
					if (d.count > 0){
						return y(d.count);
					} else {
				return y(0); }}

			})
			.attr("x", function(d) {
			if (type == 'yoy') {
				return x(d.year);}
			if (type == 'cmp') {
				return x(d.lbound);}
			})
			.attr("width", x.rangeBand())
			.attr("height", function(d) {
				if (type == 'yoy') {				
				return Math.abs(y(d.yoy_change_avg_temp) - y(0)); }
				if (type == 'cmp') {
				return Math.abs(y(d.count) - y(0)); }	
			})
		
		if (type == 'cmp') {
		var value = dat2.country_temp_increase;
		svg.append("line")
			.attr("id","vertLine")
			.attr("x1", function() {console.log(value); 
			return (3+value)/6*425;} )
			.attr("x2", function() {console.log(value); 
			return (3+value)/6*425;})	
			.attr("y1", 0)
			.attr("y2", height)
			.style("stroke-width", 2)
			.style("stroke", "red")
			.style("fill", "none");		}
			
		// Add the title	
		svg.append("text")
			.attr("x", (width / 2))             
			.attr("y", 5 - (margin.top / 2))
			.attr("text-anchor", "middle")  
			.text(title);		

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		if (type == 'yoy') {
			svg.append("g")
				.attr("class", "y axis")
				.append("text")
				.text("°Celsius")
				.attr("transform", "translate(-20, -10)")}
		
		if (type == 'cmp') {
			svg.append("g")
				.attr("class", "y axis")
				.append("text")
				.text("Count")
				.attr("transform", "translate(-20, -10)")
				svg.append("g")
				.attr("class", "x axis")
				.append("text")
				.text("°Celsius")
				.attr("transform", "translate(365, 110)")
				}				

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (0) + "," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "x axis")
			.append("line")
			.attr("y1", y(0))
			.attr("y2", y(0))
			.attr("x2", width);

	});

};