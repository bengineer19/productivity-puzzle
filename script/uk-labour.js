function labour() {
  
  var svg = d3.select("#uk-labour"),
    margin = {
      top: 15,
      right: 5,
      bottom: 15,
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

    var preCrisisData = [],
        crisisData = [],
        postCrisisData = []
        preDate = d3.timeParse("%Y")("2008"),
        postDate = d3.timeParse("%Y")("2010")
    // format the data
    data.forEach((d) => {
      d.date = parseDate(d.date);
      d.labour = +d.labour;
      if(d.date >= postDate){
        postCrisisData.push(d)
      }else if(d.date >= preDate){
        crisisData.push(d)
      }else {
        preCrisisData.push(d)
      }
    });

    // Make data continuous
    preCrisisData.push(crisisData[0])
    crisisData.push(postCrisisData[0])

    var x = d3
    .scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, (d) => d.date));

    var y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

    // Scale the range of the data
    x.domain( d3.extent(data, (d) => d.date) );
    y.domain([
      d3.min(data, (d) => d.labour) - 10,
      d3.max(data, (d) => d.labour),
    ]).nice();

    var line = d3.line()
    .x((d) => x(d.date))
    .y((d) => y(d.labour))
    .curve(d3.curveCardinal)
    

  svg.append("path")
    .data([preCrisisData])
    .style("stroke", 'indigo')
    .style("stroke-width", '3px')
    .attr("class", "line")
    .attr("d", line);

  svg.append("path")
    .data([crisisData])
    .style("stroke", 'grey')
    .style("stroke-width", '3px')
    .attr("class", "line")
    .attr("d", line);

  var translationX = x(d3.timeParse("%Y")("2010")) - x(d3.timeParse("%Y")("1998")),
      translationY = y(918.6) - y(880.4);

  var postCrisis = svg.append("path")
    .data([postCrisisData])
    .style("stroke", 'green')
    .style("stroke-width", '3px')
    .attr("class", "line")
    .attr("d", line)
  
  function repeat() {
    postCrisis
    .transition()
    .attr("transform", `translate(${-translationX}, ${-translationY})`)
    .duration(2000)
    .ease(d3.easeCubic)
    .transition()
    .duration(800)
    .transition()
    .attr("transform", "translate(0,0)")
    .ease(d3.easeCubic)
    .duration(2000)
    .transition()
    .duration(500)
    .on("end", repeat);
  }

  repeat();

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",0)")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Misc metrics normalised to 2008");

  });
}

labour();
