
var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var colors = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"];
var buckets = colors.length;

var margin = {
  top: 50,
  right: 20,
  bottom: 100,
  left: 35
};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var legendWidth = 40;

d3.json('heatmap.json', function(error, data) {
  if (error) throw error;

  var data = data.monthlyVariance;

  var years = data.map(function(obj) {return obj.year;});
    years = years.filter(function(v, i) {return years.indexOf(v) == i;});

  var temp = data.map(function(obj) {return obj.variance;});

  var minTemp = d3.min(temp);
  var maxTemp = d3.max(temp);

  var minYear = d3.min(years);
  var maxYear = d3.max(years);

  var minDate = new Date(minYear, 0);
  var maxDate = new Date(maxYear, 0);

  var gridWidth = width / years.length;
  var gridHeight = height / month.length;


  var colorScale = d3.scale.quantile()
    .domain([minTemp, maxTemp])
    .range(colors);


  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  var monthLabels = svg.selectAll(".monthLabel")
    .data(month)
    .enter()
    .append("text")
    .text(function(d) {return d;})
    .attr("x", 0)
    .attr("y", function(d, i) {return i * gridHeight;})
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridHeight / 1.5 + ")");


  var xScale = d3.time.scale()
    .domain([minDate, maxDate])
    .range([0, width]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(d3.time.years, 20);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height + 1) + ")")
    .call(xAxis);

  var temps = svg.selectAll(".years")
    .data(data, function(d) {return (d.year + ':' + d.month);});

  temps.enter()
    .append("rect")
    .attr("x", function(d) {return ((d.year - minYear) * gridWidth);})
    .attr("y", function(d) {return ((d.month - 1) * gridHeight);})
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("width", gridWidth)
    .attr("height", gridHeight);
  
  temps.transition()
      .style("fill", function(d) {return colorScale(d.variance);});

  var legend = svg.selectAll(".legend")
    .data([minTemp].concat(colorScale.quantiles()), function(d) {return d;});

  legend.enter()
    .append("g");

  legend.append("rect")
    .attr("x", function(d, i) {return legendWidth * i + (width - legendWidth * buckets);})
    .attr("y", height + 50)
    .attr("width", legendWidth)
    .attr("height", gridHeight / 2)
    .style("fill", function(d, i) {return colors[i];});

  legend.append("text")
    .text(function(d) {return (Math.floor(d * 10) / 10);}) //changes this
    .attr("x", function(d, i) {return ((legendWidth * i) + Math.floor(legendWidth / 2) - 6 + (width - legendWidth * buckets));})
    .attr("y", height + gridHeight + 50); });
