var c3margin = {top: 20, right: 50, bottom: 30, left: 80},
    c3width = parseInt(d3.select('div#chart1').style('width')) - c3margin.left - c3margin.right,
    c3height = 700 - c3margin.top - c3margin.bottom;

var c3x = d3.scaleLog()
    .range([0, c3width]);

var c3y = d3.scaleLinear()
    .range([c3height, 0]);

var color = d3.scale.category10();

var c3xAxis = d3.axisBottom(c3x);

var c3yAxis = d3.axisLeft(c3y);

var c3tooltip = floatingTooltip('dot_tooltip', 240);

function c3showDetail(d) {
  // change outline to indicategorye hover state.
  d3.select(this).attr('stroke', 'white');

  var content = '<span class="name">Country: </span><span class="value">' +
                d.residence +
                '</span><br/>' +
                '<span class="name">Refugees: </span><span class="value">' +
                addCommas(d.refugees) + '</span><br/>' +
                '<span class="name">GDP: </span><span class="value">' +
                addCommas(d.gdp.toFixed(0)) + ' Billion' + '</span><br/>' +
                '<span class="name">Population: </span><span class="value">' +
                addCommas((d.population/1000000).toFixed(1)) + ' Million' +
                '</span>';

  c3tooltip.showTooltip(content, d3.event);
}

function c3hideDetail(d) {
  // reset outline

  d3.select(this)
    .attr('stroke', 'none');

  c3tooltip.hideTooltip();
}

var c3svg = d3.select("#chart3").append("svg")
    .attr("width", c3width + c3margin.left + c3margin.right)
    .attr("height", c3height + c3margin.top + c3margin.bottom)
  .append("g")
    .attr("transform", "translate(" + c3margin.left + "," + c3margin.top + ")");

d3.csv("data/res15.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.refugees = +d.refugees;
    d.gdp = +d.gdp;
    d.gdppop = +d.gdppop;
    d.population = +d.population;
  });

  c3x.domain(d3.extent(data, function(d) { return d.gdp; })).nice();
  c3y.domain(d3.extent(data, function(d) { return d.refugees; })).nice();

  c3svg.append('line')
      .attr('x1',0).attr('x2',c3width)
      .attr('y1',c3y(400000)).attr('y2',c3y(400000))
      .style('stroke','#232323').style('stroke-dasharray','5,5');

  c3svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + c3height + ")")
      .call(c3xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", c3width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("GDP (Billion USD)");

  c3svg.append("g")
      .attr("class", "y axis")
      .call(c3yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Refugees Hosted (2015)")

  c3svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr('id', function(d) {return 's' + d.id;})
      .attr("r", 3.5)
      .attr("cx", function(d) { return c3x(d.gdp); })
      .attr("cy", function(d) { return c3y(d.refugees); })
      .style("fill", function(d) { return color(d.category); })
      .on('mouseover', c3showDetail)
      .on('mouseout', c3hideDetail);

  var legend = c3svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", c3width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", c3width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});

function byPopulation() {

    d3.csv("data/res15.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.refugees = +d.refugees;
            d.gdp = +d.gdp;
            d.gdppop = +d.gdppop;
            d.population = +d.population;
        });

        c3x = d3.scaleLog().range([0, c3width]);
        c3xAxis = d3.axisBottom(c3x);
        c3x.domain(d3.extent(data, function(d) { return d.population; })).nice();

        var changeAxis = c3svg.select('.x.axis');

        changeAxis.transition().duration(500).call(c3xAxis);
        changeAxis.select('text.label').text('Population');

        c3svg.selectAll(".dot").data(data)
            .transition().duration(500)
            .attr("cx", function(d) { return c3x(d.population); });

    });

}

function byGDP() {

    d3.csv("data/res15.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.refugees = +d.refugees;
            d.gdp = +d.gdp;
            d.gdppop = +d.gdppop;
            d.population = +d.population;
        });

        c3x = d3.scaleLog().range([0, c3width]);
        c3xAxis = d3.axisBottom(c3x);
        c3x.domain(d3.extent(data, function(d) { return d.gdp; })).nice();

        var changeAxis = c3svg.select('.x.axis');

        changeAxis.transition().duration(500).call(c3xAxis);
        changeAxis.select('text.label').text('GDP (Billion USD)');

        c3svg.selectAll(".dot").data(data)
            .transition().duration(500)
            .attr("cx", function(d) { return c3x(d.gdp); });

    });

}

function byGDPpercap() {

    d3.csv("data/res15.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.refugees = +d.refugees;
            d.gdp = +d.gdp;
            d.gdppop = +d.gdppop;
            d.population = +d.population;
        });

        c3x = d3.scaleLog().range([0, c3width]);
        c3xAxis = d3.axisBottom(c3x);
        c3x.domain(d3.extent(data, function(d) { return d.gdppop; })).nice();

        var changeAxis = c3svg.select('.x.axis');

        changeAxis.transition().duration(500).call(c3xAxis);
        changeAxis.select('text.label').text('GDP per Capita (USD)');

        c3svg.selectAll(".dot").data(data)
            .transition().duration(500)
            .attr("cx", function(d) { return c3x(d.gdppop); });

    });

}

function byLandArea() {

    d3.csv("data/res15.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.refugees = +d.refugees;
            d.gdp = +d.gdp;
            d.landarea = +d.landarea;
            d.population = +d.population;
        });

        c3x = d3.scaleLog().range([0, c3width]);
        c3xAxis = d3.axisBottom(c3x);
        c3x.domain(d3.extent(data, function(d) { return d.landarea; })).nice();

        var changeAxis = c3svg.select('.x.axis');

        changeAxis.transition().duration(500).call(c3xAxis);
        changeAxis.select('text.label').text('Land Area (Sq Km)');

        c3svg.selectAll(".dot").data(data)
            .transition().duration(500)
            .attr("cx", function(d) { return c3x(d.landarea); });

    });

}

function byUnemployment() {

    d3.csv("data/res15.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.refugees = +d.refugees;
            d.gdp = +d.gdp;
            d.unemployment = +d.unemployment;
            d.population = +d.population;
        });

        c3x = d3.scaleLinear().range([0, c3width]);
        c3xAxis = d3.axisBottom(c3x);
        c3x.domain(d3.extent(data, function(d) { return d.unemployment; })).nice();

        var changeAxis = c3svg.select('.x.axis');

        changeAxis.transition().duration(500).call(c3xAxis);
        changeAxis.select('text.label').text('Unemployment (2014)');

        c3svg.selectAll(".dot").data(data)
            .transition().duration(500)
            .attr("cx", function(d) { return c3x(d.unemployment); });

    });

}
