const margin = { top: 20, right: 30, bottom: 40, left: 30 };
const percentFormat = (num) => d3.format(".0%")(num / 100);
const leftPadding = 5;

const svg = d3.select("#g7-finance");
const svgGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
  
const width = svg.attr("width") - margin.left - margin.right;
const height = svg.attr("height") - margin.top - margin.bottom;


const delay = function (d, i) {
  return i * 40;
};

function sortData(data) {
  return data.sort((a, b) => b.value - a.value);
}

function removeGeoAreasWithNoData(data) {
  return data.filter((d) => d.value);
}

function prepareData(data) {
  return data.reduce((accumulator, d) => {
    Object.keys(d).forEach((k) => {
      if (!Number.isInteger(+k)) {
        return;
      }
      let value;
      if (d[+k] === "..") {
        value = 0;
      } else {
        value = +d[+k];
      }
      const newEntry = {
        value,
        countryCode: d.CountryCode,
        countryName: d.Country,
      };
      if (accumulator[+k]) {
        accumulator[+k].push(newEntry);
      } else {
        accumulator[+k] = [newEntry];
      }
    });
    return accumulator;
  }, {});
}

function xAccessor(d) {
  return d.value;
}

function yAccessor(d) {
  return d.countryName;
}

const xScale = d3.scaleLinear().domain([0, 8]).range([0, width]);

const yScale = d3.scaleBand().rangeRound([0, height], 1).padding(0.1);

function drawXAxis(el) {
  el.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(${leftPadding},${height})`)
    .call(d3.axisBottom(xScale).tickFormat(percentFormat));
  
  svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height + 6)
  .text("% of value added by finance sector");
}

function drawYAxis(el, data, t) {
  let axis = el.select(".axis--y");
  if (axis.empty()) {
    axis = el.append("g").attr("class", "axis axis--y");
  }

  axis.transition(t).call(d3.axisLeft(yScale)).selectAll("g").delay(delay);
}


function drawBars(el, data, t) {
  let barsG = el.select(".bars-g");
  if (barsG.empty()) {
    barsG = el.append("g").attr("class", "bars-g");
  }

  const bars = barsG.selectAll(".bar").data(data, yAccessor);
  bars.exit().remove();
  bars
    .enter()
    .append("rect")
    .attr("class", (d) => (d.countryName === "UK" ? "bar uk-bar" : "bar"))
    .attr("x", leftPadding)
    .merge(bars)
    .transition(t)
    .attr("y", (d) => yScale(yAccessor(d)))
    .attr("width", (d) => xScale(xAccessor(d)))
    .attr("height", yScale.bandwidth())
    .delay(delay);
}


fetch("/data/G7_finance.csv")
  .then((res) => res.text())
  .then((res) => {
    const data = prepareData(d3.csvParse(res));
    const years = Object.keys(data).map((d) => +d);
    const lastYear = years[years.length - 1];
    let startYear = years[0];
    let selectedData = removeGeoAreasWithNoData(sortData(data[startYear]));
    let geoAreas = selectedData.map(yAccessor);

    d3.select(".year").text(startYear);

    yScale.domain(geoAreas);
    drawXAxis(svgGroup, selectedData);
    drawYAxis(svgGroup, selectedData);
    drawBars(svgGroup, selectedData);

    d3.interval(() => {
      const t = d3.transition().duration(600).ease(d3.easeLinear);

      startYear += 1;
      selectedData = removeGeoAreasWithNoData(sortData(data[startYear]));

      d3.select("#g7-finance-year").text(startYear);

      yScale.domain(selectedData.map(yAccessor));
      drawYAxis(svgGroup, selectedData, t);
      drawBars(svgGroup, selectedData, t);

      if (startYear === lastYear) {
        startYear = years[0]
      }
    }, 600);
  });
