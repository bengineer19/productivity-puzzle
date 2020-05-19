function labour() {
  
  var svg = d3.select("#uk-labour"),
    margin = {
      top: 15,
      right: 15,
      bottom: 25,
      left: 50,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y %b");


    
  // Set ranges
  // var x = d3.scaleTime().range([0, width]);
  // var y = d3.scaleLinear().range([height, 0]);

  

  // Get the data
  d3.csv("../data/uk_labour.csv").then((data) => {
    // format the data
    data.forEach((d) => {
      d.date = parseDate(d.date);
      d.labour = +d.labour;
    });

    var x = d3
    .scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, (d) => d.date));

    var y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

    // Scale the range of the data
    x.domain( d3.extent(data, (d) => d.date) );
    y.domain([
      d3.min(data, (d) => d.labour),
      d3.max(data, (d) => d.labour),
    ]).nice();

    var line = d3.line()
    .x((d) => x(d.date))
    .y((d) => y(d.labour))

    // Add the line path.
    svg.append("path")
    .data([data])
    .style("stroke", 'indigo')
    .style("stroke-width", '3px')
    .attr("class", "line")
    .attr("d", line);

    // // Add the x Axis
    // svg
    //   .append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x));

    // // Add the y Axis
    // svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",0)");

  });
}

labour();

/*
d3.csv("../data/uk_labour.csv").then((d) => labourOutput(d));

function labourOutput(data) {
  var svg = d3.select("#uk-labour"),
    margin = {
      top: 15,
      right: 15,
      bottom: 25,
      left: 50,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y %b");

  data.forEach(function (d) {
    d.date = parseDate(d.date);
    d.labour = +d.labour;
  });
  console.log(data);

  var x = d3
    .scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, (d) => d.date));

  var y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.labour; })]);

  var line = d3
    .line()
    .curve(d3.curveCardinal)
    .x((d) => x(d.date))
    .y((d) => y(d.labour));

  //   svg
  //   .append("g")
  //   .attr("class", "x-axis")
  //   .attr("transform", "translate(0," + (height - margin.bottom) + ")")
  //   .call(d3.axisBottom(x));

  // svg
  //   .append("g")
  //   .attr("class", "y-axis")
  //   .attr("transform", "translate(" + margin.left + ",0)");

  // svg.append("text")
  //   .attr("class", "y label")
  //   .attr("text-anchor", "end")
  //   .attr("y", 0)
  //   .attr("dy", ".75em")
  //   .attr("transform", "rotate(-90)")
  //   .text("Misc metrics normalised to 2008");
  
  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line);


  width = width - margin.right;
  height = height - margin.bottom;
  var curtain = svg
    .append("rect")
    .attr("x", -1 * (width + margin.left))
    .attr("y", -1 * height)
    .attr("height", height)
    .attr("width", width)
    .attr("class", "curtain")
    .attr("transform", "rotate(180)")
    .style("fill", "#ffffff");

  curtain
    .transition()
    .duration(5000)
    .ease(d3.easeCubic)
    .attr("x", -2 * width);
}
*/
