// Sebastiaan Hoekstra stnr 10264523 

// Slider adapted from Sujeet Sreenivasan http://sujeetsr.github.io/d3.slider/

d3.slider = function module() {
  "use strict";

  var div, min = 0, max = 100, svg, value, axis, 
  height=40, rect,
  rectHeight = 12,
  tickSize = 6,
  margin = {top: 25, right: 25, bottom: 15, left: 25}, 
  ticks = 0, tickValues, scale, tickFormat, dragger, width, 
  range = false;

  function slider(selection) {
    selection.each(function() {
      div = d3.select(this).classed('d3slider', true);
      width = parseInt(div.style("width"), 10)-(margin.left 
                                                + margin.right);

      value = value || min; 
      scale = d3.scale.linear().domain([min, max]).range([0, width])
      .clamp(true);
      
      // SVG 
      svg = div.append("svg")
      .attr("class", "d3slider-axis")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + 
            "," + margin.top + ")");

      // Range rect
      svg.append("rect")
      .attr("class", "d3slider-rect-range")
      .attr("width", width)
      .attr("height", rectHeight);
     
      // Range rect 
      if (range) {
        svg.append("rect")
        .attr("class", "d3slider-rect-value")
        .attr("width", scale(value))
        .attr("height", rectHeight);
      }
      
      // Axis      
      var axis = d3.svg.axis()
      .scale(scale)
      .orient("bottom");
      
      if (ticks != 0) {
        axis.ticks(ticks);
        axis.tickSize(tickSize);
      } else if (tickValues) {
        axis.tickValues(tickValues);
        axis.tickSize(tickSize);
      } else {
        axis.ticks(0);
        axis.tickSize(0);
      }
      if (tickFormat) {
        axis.tickFormat(tickFormat);
      }
      
      svg.append("g")
      .attr("transform", "translate(0," + rectHeight + ")")
      .call(axis)
   
      var values = [value];
      dragger = svg.selectAll(".dragger")
      .data(values)
      .enter()
      .append("g")
      .attr("class", "dragger")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      }) 
      
      var displayValue = null;
      if (tickFormat) { 
        displayValue = tickFormat(value);
      } else {
        displayValue = d3.format(",.0f")(value);
      }
      
      dragger.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(displayValue);

      dragger.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 10)
      .attr("transform", function(d) {
        return "translate(0,6)";
      });
      
      dragger.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function(d) {
        return "translate(0,6)";
      });


      // Enable dragger drag 
      var dragBehaviour = d3.behavior.drag();
      dragBehaviour.on("drag", slider.drag);
	  dragBehaviour.on("dragend", function() {
		  d3.map.year = Math.round(value);
		  d3.map.renderMap(Math.round(value));
	  });
      dragger.call(dragBehaviour);
	  	 
    });
  }

  slider.draggerTranslateFn = function() {
    return function(d) {
      return "translate(" + scale(d) + ")";
    }
  }

  slider.drag = function() {
    var pos = d3.event.x;
    slider.move(pos+margin.left);
  }

  slider.move = function(pos) {
    value = scale.invert(pos - margin.left);
    var values = [value];

    // Move dragger
    svg.selectAll(".dragger").data(values)
    .attr("transform", function(d) {		
      return "translate(" + scale(d) + ")";
    });
    
    var displayValue = null;
    if (tickFormat) { 
      displayValue = tickFormat(value);
    } else {
      displayValue = d3.format(",.0f")(value);
    }
    svg.selectAll(".dragger").select("text")
    .text(displayValue);
   
    if (range) { 
      svg.selectAll(".d3slider-rect-value")
      .attr("width", scale(value));
    }
  }

  // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  };

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  };
 
  slider.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return slider;
  }
  
  slider.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return slider;
  } 

  slider.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return slider;
  } 
  
  slider.showRange = function(_) {
    if (!arguments.length) return range;
    range = _;
    return slider;
  } 

  return slider;

};



