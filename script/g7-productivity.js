d3.csv("../data/G7_productivity.csv").then((d) => chart(d));

function chart(data) {
  var keys = data.columns.slice(1);

  var parseTime = d3.timeParse("%Y"),
    formatDate = d3.timeFormat("%Y"),
    bisectDate = d3.bisector((d) => d.date).left,
    formatValue = d3.format(",.0f");

  data.forEach(function (d) {
    d.date = parseTime(d.date);
    return d;
  });

  var svg = d3.select("#g7-productivity"),
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
    .y((d) => y(d.productivity));

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
    .text("Productivity %, normalised to 2007 levels");

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
    var countries = keys.map(function (id) {
      return {
        id: id,
        values: data.map((d) => {
          return {
            date: d.date,
            productivity: +d[id],
          };
        }),
      };
    });

    y.domain([
      d3.min(countries, (d) => d3.min(d.values, (c) => c.productivity)),
      d3.max(countries, (d) => d3.max(d.values, (c) => c.productivity)),
    ]).nice();

    svg.selectAll(".y-axis").transition().duration(100).call(d3.axisLeft(y));

    var country = svg.selectAll(".countries").data(countries);

    country.exit().remove();

    country
      .enter()
      .insert("g", ".focus")
      .append("path")
      .attr("class", (d) => "line countries " + d.id)
      .style("stroke", (d) => z(d.id))
      .merge(country)
      .transition()
      .duration(500)
      .attr("d", (d) => line(d.values));

    tooltip(keys);

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

  function tooltip(keys) {
    var labels = focus.selectAll(".lineHoverText").data(keys);

    labels
      .enter()
      .append("text")
      .attr("class", "lineHoverText")
      .style("fill", (d) => z(d))
      .attr("text-anchor", "start")
      .attr("font-size", 12)
      .attr("dy", (_, i) => 1 + i * 2 + "em")
      .merge(labels);

    var circles = focus.selectAll(".hoverCircle").data(keys);

    circles
      .enter()
      .append("circle")
      .attr("class", "hoverCircle")
      .style("fill", (d) => z(d))
      .attr("r", 2.5)
      .merge(circles);

    svg
      .selectAll(".overlay")
      .on("mouseover", function () {
        focus.style("display", null);
      })
      .on("mouseout", function () {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus
        .select(".lineHover")
        .attr("transform", "translate(" + x(d.date) + "," + height + ")");

      focus
        .select(".lineHoverDate")
        .attr(
          "transform",
          "translate(" + x(d.date) + "," + (height + margin.bottom) + ")"
        )
        .text(formatDate(d.date));

      focus
        .selectAll(".hoverCircle")
        .attr("cy", (e) => y(d[e]))
        .attr("cx", x(d.date));

      focus
        .selectAll(".lineHoverText")
        .attr("transform", "translate(" + x(d.date) + "," + height / 2.5 + ")")
        .text((e) => e + " " + d[e]);

      x(d.date) > width - width / 4
        ? focus
            .selectAll("text.lineHoverText")
            .attr("text-anchor", "end")
            .attr("dx", -10)
        : focus
            .selectAll("text.lineHoverText")
            .attr("text-anchor", "start")
            .attr("dx", 10);
    }
  }
}
