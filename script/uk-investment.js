let svgGroupInvestment, x, y;
let investmentAnimationStarted = false;


function scrollChangedInvestment(scroll_pos) {
  let investmentChart = document.getElementById("uk-investment");
  if(isScrolledIntoView(investmentChart) && !investmentAnimationStarted) {
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
    
    investmentAnimationStarted = true;
  }
}

function drawInvestment() {
  const margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 40,
  };
  const leftOffset = 20;

  const svg = d3.select("#uk-investment");
  svgGroupInvestment = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  // Parse the Data
  d3.csv("data/uk_investment.csv").then((data) => {
    // Y scale and axis
    y = d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, 6]);

    svgGroupInvestment.append("g").call(d3.axisLeft(y));

    // X scale and axis
    x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.Year));

    svgGroupInvestment
      .append("g")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(d3.axisBottom(x));

    // Add area for 90th - 10th percentiles
    pecentileDifference = d3
      .area()
      .curve(d3.curveCardinal)
      .x((d) => x(d.Year))
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
      .data(data)
      .enter()
      .append("line")
      .attr("class", "diff-line")
      .attr("transform", `translate(${leftOffset},0)`)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("x1", (d) => x(d.Year))
      .attr("x2", (d) => x(d.Year))
      .attr("stroke", "grey")
      .attr("stroke-width", "1px");

    // Circles for OECD avg
    svgGroupInvestment
      .selectAll("mycircle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "oecd-circle")
      .attr("transform", `translate(${leftOffset},0)`)
      .attr("cy", y(0))
      .attr("cx", (d) => x(d.Year))
      .attr("r", "6")
      .style("fill", "#1A237E");

    // Circles for UK
    svgGroupInvestment
      .selectAll("mycircle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "uk-circle")
      .attr("transform", `translate(${leftOffset},0)`)
      .attr("cy", y(0))
      .attr("cx", (d) => x(d.Year))
      .attr("r", "6")
      .style("fill", "#E65100");
  });
}


drawInvestment();
