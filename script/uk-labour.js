function labour() {
  const svg = d3.select("#uk-labour"),
    margin = {
      top: 15,
      right: 5,
      bottom: 15,
      left: 50,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%Y %b");
  const preDate = d3.timeParse("%Y")("2008");
  const postDate = d3.timeParse("%Y")("2010");

  // Get the data
  d3.csv("../data/uk_labour.csv").then((data) => {
    var preCrisisData = [],
      crisisData = [],
      postCrisisData = [];

    // Split up into 3 sections
    data.forEach((d) => {
      d.date = parseDate(d.date);
      d.labour = +d.labour;
      if (d.date >= postDate) {
        postCrisisData.push(d);
      } else if (d.date >= preDate) {
        crisisData.push(d);
      } else {
        preCrisisData.push(d);
      }
    });

    // Make data continuous
    preCrisisData.push(crisisData[0]);
    crisisData.push(postCrisisData[0]);

    const x = d3
      .scaleTime()
      .rangeRound([margin.left, width - margin.right])
      .domain(d3.extent(data, (d) => d.date));

    const y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

    // Scale the range of the data
    x.domain(d3.extent(data, (d) => d.date));
    y.domain([
      d3.min(data, (d) => d.labour) - 10,
      d3.max(data, (d) => d.labour),
    ]).nice();

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.labour))
      .curve(d3.curveCardinal);

    svg
      .append("path")
      .data([preCrisisData])
      .style("stroke", "indigo")
      .style("stroke-width", "3px")
      .attr("class", "line")
      .attr("d", line);

    svg
      .append("path")
      .data([crisisData])
      .style("stroke", "grey")
      .style("stroke-width", "3px")
      .attr("class", "line")
      .attr("d", line);

    const translationX = x(d3.timeParse("%Y")("2010")) - x(d3.timeParse("%Y")("1998"));
    const translationY = y(918.6) - y(880.4);

    const postCrisis = svg
      .append("path")
      .data([postCrisisData])
      .style("stroke", "green")
      .style("stroke-width", "3px")
      .attr("class", "line")
      .attr("d", line);

    const repeat = () => {
      postCrisis
        .transition()
        .attr("transform", `translate(${-translationX}, ${-translationY})`)
        .duration(1500)
        .ease(d3.easeCubic)
        .transition()
        .duration(400)
        .transition()
        .attr("transform", "translate(0,0)")
        .ease(d3.easeBack)
        .duration(1500)
        .transition()
        .duration(1000)
        .on("end", repeat);
    }

    repeat();

    // Add X-axis
    svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));
    
    // Add Y-axis
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(y));

    // Add y label
    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 0)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("UK total actual weekly hours worked (millions)");
  });
}

labour();
