d3.csv("../data/uk_output.csv").then((d) => chartOutput(d));

function chartOutput(data) {
  var keys = data.columns.slice(1);
  console.log(data)

  var parseTime = d3.timeParse("%b-%y"),
    formatDate = d3.timeFormat("%b-%y"),
    bisectDate = d3.bisector((d) => d.date).left,
    formatValue = d3.format(",.0f");

  data.forEach(function (d) {
    d.date = parseTime(d.date);
    return d;
  });

  var svg = d3.select("#uk-output"),
    margin = {
      top: 15,
      right: 15,
      bottom: 25,
      left: 50,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3
    .scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, (d) => d.date));

  var y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

  var z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3
    .line()
    .curve(d3.curveCardinal)
    .x((d) => x(d.date))
    .y((d) => y(d.metricVal));

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",0)");

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 6)
    .text("Years innit");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("metricVal %, normalised to 2007 levels");

  var focus = svg.append("g").attr("class", "focus").style("display", "none");

  focus
    .append("line")
    .attr("class", "lineHover")
    .style("stroke", "#999")
    .attr("stroke-width", 1)
    .style("shape-rendering", "crispEdges")
    .style("opacity", 0.5)
    .attr("y1", -height)
    .attr("y2", 0);

  focus
    .append("text")
    .attr("class", "lineHoverDate")
    .attr("text-anchor", "middle")
    .attr("font-size", 12);

  var overlay = svg
    .append("rect")
    .attr("class", "overlay")
    .attr("x", margin.left)
    .attr("width", width - margin.right - margin.left)
    .attr("height", height);

  update();

  function update() {
    var metrics = keys.map(function (id) {
      return {
        id: id,
        values: data.map((d) => {
          return {
            date: d.date,
            metricVal: +d[id],
          };
        }),
      };
    });

    y.domain([
      d3.min(metrics, (d) => d3.min(d.values, (c) => c.metricVal)),
      d3.max(metrics, (d) => d3.max(d.values, (c) => c.metricVal)),
    ]).nice();

    svg.selectAll(".y-axis").transition().duration(100).call(d3.axisLeft(y));

    var metric = svg.selectAll(".metrics").data(metrics);

    metric.exit().remove();

    var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(y(94))
    .y1(function(d) { return y(d.metricVal); });

    metric
      .enter()
      .insert("g", ".focus")
      .append("path")
      .attr("class", (d) => "line metrics " + d.id)
      .attr("data-legend",function(d) { return d.id})
      .style("stroke", (d) => z(d.id))
      .style("fill", function(d) { 
        if(d.id === "Productivity"){
          return z(d.id);
        } else {
          return '';
        }})
      .merge(metric)
      // .attr("d", (d) => line(d.values));
      .attr("d", (d) => {
        if(d.id === "Productivity"){
          return area(d.values)
        }
        else {
          return line(d.values)
        }
      });

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
}
