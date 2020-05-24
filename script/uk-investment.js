let svgGroupInvestment, x, y;
let investmentAnimationStarted = false;

function drawInvestment() {
  const margin = {
    top: 10,
    right: 30,
    bottom: 15,
    left: 40,
  };

  const svg = d3.select("#uk-investment");
  svgGroupInvestment = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y");
  // Parse the Data
  d3.csv("data/uk_investment.csv").then((data) => {
    data.forEach(function (d) {
      d.date = parseDate(d.Year);
      return d;
    });

    // Y scale and axis
    y = d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, 6]);

    svgGroupInvestment.append("g").call(d3.axisLeft(y));

    // X scale and axis
    x = d3
      .scaleTime()
      .range([0, width])
      // .domain([parseDate("1994"), d3.max(data, (d) => d.date)]);
      .domain(d3.extent(data, (d) => d.date));

    svgGroupInvestment
      .append("g")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(d3.axisBottom(x));

    // Add labels
    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 0)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Government investment (GFCF) as % of GDP");

    // Add area for 90th - 10th percentiles
    pecentileDifference = d3
      .area()
      .curve(d3.curveCardinal)
      .x((d) => x(d.date))
      .y1((d) => y(d.percentile_90th))
      .y0((d) => y(d.percentile_10th));

    // Add pecentile area
    svgGroupInvestment
      .append("path")
      .style("fill", "green")
      .style("fill-opacity", 0.2)
      .attr("class", "difference")
      .attr("d", pecentileDifference(data));

    // Difference lines between OECD avg and UK
    svgGroupInvestment
      .selectAll("myline")
      .data(data.slice(1))
      .enter()
      .append("line")
      .attr("class", "diff-line")
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("x1", (d) => x(d.date))
      .attr("x2", (d) => x(d.date))
      .attr("stroke", "grey")
      .attr("stroke-width", "1px");

    // Circles for OECD avg
    svgGroupInvestment
      .selectAll("mycircle")
      .data(data.slice(1))
      .enter()
      .append("circle")
      .attr("class", "oecd-circle")
      .attr("cy", y(0))
      .attr("cx", (d) => x(d.date))
      .attr("r", "6")
      .style("fill", "#1A237E");

    // Circles for UK
    svgGroupInvestment
      .selectAll("mycircle")
      .data(data.slice(1))
      .enter()
      .append("circle")
      .attr("class", "uk-circle")
      .attr("cy", y(0))
      .attr("cx", (d) => x(d.date))
      .attr("r", "6")
      .style("fill", "#E65100");
  });
}

function scrollChangedInvestment(scroll_pos) {
  let investmentChart = document.getElementById("uk-investment");
  if (isScrolledIntoView(investmentChart) && !investmentAnimationStarted) {
    try {
      svgGroupInvestment
        .selectAll(".uk-circle")
        .transition()
        .duration(4000)
        .attr("cy", (d) => y(d.UK));

      svgGroupInvestment
        .selectAll(".oecd-circle")
        .transition()
        .duration(2000)
        .attr("cy", (d) => y(d.OECD_avg));

      svgGroupInvestment
        .selectAll(".diff-line")
        .transition()
        .duration(4000)
        .attr("y2", (d) => y(d.OECD_avg))
        .attr("y1", (d) => y(d.UK));

      // Add labels
      svgGroupInvestment
        .append("text")
        .attr("class", "percentile-label")
        .style("stroke", "green")
        .style("fill", "none")
        .style("stroke-opacity", 0)
        .attr("y", y(5.7))
        .attr("x", x(d3.timeParse("%Y")(1999)))
        .text("OECD 90th to 10th percentile range")
        .transition()
        .duration(2000)
        .style("stroke-opacity", 0.4);
        
      svgGroupInvestment
        .append("text")
        .attr("class", "percentile-label")
        .style("stroke", "#1A237E")
        .style("fill", "none")
        .style("stroke-opacity", 0)
        .attr("y", y(4.0))
        .attr("x", x(d3.timeParse("%Y")(2004)))
        .text("OECD average")
        .transition()
        .duration(5000)
        .style("stroke-opacity", 1);

      svgGroupInvestment
        .append("text")
        .attr("class", "percentile-label")
        .style("stroke", "#E65100")
        .style("stroke-opacity", 0)
        .style("fill", "none")
        .attr("y", y(1.2))
        .attr("x", x(d3.timeParse("%Y")(1998)))
        .text("UK")
        .transition()
        .duration(7000)
        .style("stroke-opacity", 1)

      investmentAnimationStarted = true;
    } catch (e) {
      throw e;
      if (e instanceof TypeError) {
      } else {
        throw e;
      }
    }
  }
}

drawInvestment();
