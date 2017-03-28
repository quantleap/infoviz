// Sebastiaan Hoekstra stnr 10264523 

// Slider adapted from Sujeet Sreenivasan http://sujeetsr.github.io/d3.slider/

d3.slider = function sliderModule() {
  "use strict";

  var div, min = 0, max = 100, svg, minPos, maxPos, axis, 
  height=40, rect,
  rectHeight = 12,
  tickSize = 6,
  margin = {top: 25, right: 25, bottom: 15, left: 25}, 
  ticks = 0, tickValues, scale, tickFormat, minDragger, maxDragger, width, 
  range = false;
 

  function slider(selection) {
    selection.each(function() {
      div = d3.select(this).classed('d3slider', true);
      width = parseInt(div.style("width"), 10)-(margin.left 
                                                + margin.right);
	   
      minPos = minPos || min;
	  maxPos = maxPos || min;	  
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
        .attr("width", scale(maxPos)-scale(minPos))
        .attr("height", rectHeight)
		.attr("transform", "translate(" + scale(minPos) + ")");
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
      .call(axis);
   
      maxDragger = svg.selectAll(".maxDragger")
      .data([maxPos])
      .enter()
      .append("g")
      .attr("class", "maxDragger")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      });
      
      var displayValue = null;
      if (tickFormat) { 
        displayValue = tickFormat(maxPos);
      } else {
        displayValue = d3.format(",.0f")(maxPos);
      }
      
      maxDragger.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(displayValue);

      maxDragger.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 10)
      .attr("transform", function() {
        return "translate(0,6)";
      });
      
      maxDragger.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function() {
        return "translate(0,6)";
      });
	  
	  minDragger = svg.selectAll(".minDragger")
      .data([minPos])
      .enter()
      .append("g")
      .attr("class", "minDragger")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      });

      var displayValue2 = null;
      if (tickFormat) { 
        displayValue2 = tickFormat(minPos);
      } else {
        displayValue2 = d3.format(",.0f")(minPos);
      }
	  
	   minDragger.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(displayValue2);
       
      minDragger.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 10)
      .attr("transform", function() {
        return "translate(0,6)";
      });
      
      minDragger.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function() {
        return "translate(0,6)";
      });

      // Enable dragger drag 
      var minDragBehaviour = d3.behavior.drag();
      minDragBehaviour.on("drag", slider.dragMin);
	  minDragBehaviour.on("dragend", function() {
		  let low = slider.get_min_value();
		  let high = slider.get_max_value();
		  var url = '/country/'.concat(currentCountryISO).concat('/annual_temperatures').concat('?begin=').concat(low).concat('&end=').concat(high);	
		  if (navExplore) {
			  var map = d3.map(low,high);
		  }; 
		  if (navCompare) {
			  var bubblechart = d3.bubblechart(low,high);		  
		  };
		  if (navAnnual) {
			  var linechart = d3.linechart('#row','Absolute temperatures', url , 'abstemp','avg');
			  var barchart = d3.barchart('#row2','Annual temperature change', url , 'tempchangebar','yoy');
			  var comparison = d3.barchart('#row3','Country comparison over annual temperature change', '/temp_change_distribution/'.concat(low).concat('/').concat(high).concat('/').concat(currentCountryISO).concat('?bins=10&lbound=-3&ubound=3'), 'countrycomparison','cmp');
		  };	
		  if (navMonthly) {
			  var heatmap = d3.heatmap(currentCountryISO, low, high);
		  };		  
	   });
	   
	  var maxDragBehaviour = d3.behavior.drag();
      maxDragBehaviour.on("drag", slider.dragMax);
	  maxDragBehaviour.on("dragend", function() {
		  let low = slider.get_min_value();
		  let high = slider.get_max_value();
		  var url = '/country/'.concat(currentCountryISO).concat('/annual_temperatures').concat('?begin=').concat(low).concat('&end=').concat(high);	  
		  if (navExplore) {
			  //switchToMap();
			  var map = d3.map(low,high);
		  }; 
		  if (navCompare) {
			  //switchToBubble();
			  var bubblechart = d3.bubblechart(low,high);			  
		  };
		  if (navAnnual) {
			  //switchToChart();
			  var linechart = d3.linechart('#row','Absolute temperatures', url , 'abstemp','avg');
			  var barchart = d3.barchart('#row2','Annual temperature change', url , 'tempchangebar','yoy');	
			  var comparison = d3.barchart('#row3','Country comparison over annual temperature change', '/temp_change_distribution/'.concat(low).concat('/').concat(high).concat('/').concat(currentCountryISO).concat('?bins=10&lbound=-3&ubound=3'), 'countrycomparison','cmp');
		  };	
		  if (navMonthly) {
			  //switchToHeatmap();
			  var heatmap = d3.heatmap(currentCountryISO, low, high);
		  };		  
	   });

      minDragger.call(minDragBehaviour);
	  maxDragger.call(maxDragBehaviour);

    });
  }

  slider.draggerTranslateFn = function() {
    return function(d) {
      return "translate(" + scale(d) + ")";
    }
  };

  slider.dragMin = function() {
    var pos = d3.event.x;
    slider.moveMin(pos+margin.left);
  };
  
  slider.dragMax = function() {
    var pos = d3.event.x;
    slider.moveMax(pos+margin.left);
  };

  slider.moveMin = function(pos) {
    minPos = scale.invert(pos - margin.left);
	if (minPos > maxPos) {
		minPos = maxPos - 1;
	}
	
    // Move dragger
    svg.selectAll(".minDragger").data([minPos])
    .attr("transform", function(d) {		
      return "translate(" + scale(d) + ")";
    });
	
    svg.selectAll(".minDragger").data([minPos])
    .attr("transform", function(d) {		
      return "translate(" + scale(d) + ")";
    });
    
    var displayValue = null;
    if (tickFormat) { 
      displayValue = tickFormat(minPos);
      min = displayValue;
    } else {
      displayValue = d3.format(",.0f")(minPos);
    }
    svg.selectAll(".minDragger").select("text")
    .text(displayValue);
   
    if (range) { 
      svg.selectAll(".d3slider-rect-value")
	  .attr("transform", "translate(" + scale(minPos) + ")")
      .attr("width", scale(maxPos)-scale(minPos));
    }
  };
  
slider.moveMax = function(pos) {
    maxPos = scale.invert(pos - margin.left);
	if (maxPos < minPos) {
		maxPos = minPos + 1;
	}

    // Move dragger
    svg.selectAll(".maxDragger").data([maxPos])
    .attr("transform", function(d) {		
      return "translate(" + scale(d) + ")";
    });
	
    svg.selectAll(".maxDragger").data([maxPos])
    .attr("transform", function(d) {		
      return "translate(" + scale(d) + ")";
    });
    
    var displayValue = null;
    if (tickFormat) { 
      displayValue = tickFormat(maxPos);
      min = displayValue;
    } else {
      displayValue = d3.format(",.0f")(maxPos);
    }
    svg.selectAll(".maxDragger").select("text")
    .text(displayValue);
   
    if (range) { 
      svg.selectAll(".d3slider-rect-value")
	  .attr("transform", "translate(" + scale(minPos) + ")")
      .attr("width", scale(maxPos)-scale(minPos));
    }
  };

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
  };
  
  slider.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return slider;
  };

  slider.minPos = function(_) {
    if (!arguments.length) return minPos;
    minPos = _;
    return slider;
  };

  slider.maxPos = function(_) {
    if (!arguments.length) return maxPos;
    maxPos = _;
    return slider;
  };
  
  slider.showRange = function(_) {
    if (!arguments.length) return range;
    range = _;
    return slider;
  };
  
  slider.get_min_value = function() {
    if (!arguments.length) return Math.round(minPos);
  }

  slider.get_max_value = function() {
    if (!arguments.length) return Math.round(maxPos);
  }

  return slider;

};



