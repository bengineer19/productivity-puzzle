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

    // Add line path.
    svg.append("path")
    .data([data])
    .style("stroke", 'indigo')
    .style("stroke-width", '3px')
    .attr("class", "line")
    .attr("d", line);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",0)");

    svg.selectAll(".y-axis").call(d3.axisLeft(y));

  });
}

labour();
