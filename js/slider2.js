var slider2margin = {right: 50, left: 50},
    slider2width = parseInt(d3.select('div#chart2').style('width')),
    slider2height = 100;

var slider2svg = d3.select('div.slider2').append('svg')
    .attr('width',slider2width)
    .attr('height',slider2height);

var slider2x = d3.scaleLinear()
    .domain([2000, 2015])
    .range([0, slider2width - slider2margin.right*2])
    .clamp(true);

var slider2 = slider2svg.append("g")
    .attr("class", "slider2")
    .attr("transform", "translate(" + slider2margin.left + "," + slider2height / 2 + ")");

d3.select('#chart2').select('h1.year').html('2000');

slider2.append("line")
    .attr("class", "track")
    .attr("x1", slider2x.range()[0])
    .attr("x2", slider2x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider2.interrupt(); })
        .on("start drag", function() {
            c2updateChart(slider2x.invert(d3.event.x).toFixed(0));
            c2handle.attr('cx',d3.event.x);
            d3.select('h1.year').html(slider2x.invert(d3.event.x).toFixed(0));
            var currentYear = slider2x.invert(d3.event.x).toFixed(0);
            d3.json('data/residence_totals.json', function(error, data){
                displaced.datum(data).html(function(d) {return 'Total Hosted: <b>' + (d[currentYear]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
            });
        }));

slider2.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 24 + ")")
  .selectAll("text")
  .data(slider2x.ticks(16))
  .enter().append("text")
    .attr("x", slider2x)
    .attr("text-anchor", "middle")
    .text(function(d) { return d;});

var c2handle = slider2.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

/*
slider2.transition().delay(2000) // Gratuitous intro!
    .duration(7500)
    .tween("hue", function() {
      var i = d3.interpolate(2000, 2015);
      return function(t) { updateChart(i(t).toFixed(0)); };
  });
*/
var c2displaced = d3.select('#chart2').select('h2.displaced');

d3.json('data/residence_totals.json', function(error, data){ c2displaced.datum(data).html(function(d) {return 'Total Hosted: <b>' + (d[2000]['FIELD2']/1000000).toFixed(1) + 'M</b>';})});

function c2nextYear() {
  var current = slider2x.invert(c2handle.attr('cx')).toFixed(0);
  var next = +current + 1;
  if (current == 2015) {next = 2000;}
  if (next == 2016) {next = 2000;}
  c2handle.transition().duration(250).attr('cx', slider2x(next));
  c2updateChart(next);
  d3.select('#chart2').select('h1.year').text(next);
  d3.json('data/residence_totals.json', function(error, data){
      c2displaced.datum(data).html(function(d) {return 'Total Hosted: <b>' + (d[next]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
  });
}

function c2prevYear() {
  var current = slider2x.invert(c2handle.attr('cx')).toFixed(0);
  var next = +current - 1;
  if (next == 1999) {next = 2015;}
  c2handle.transition().duration(250).attr('cx', slider2x(next));
  c2updateChart(next);
  d3.select('#chart2').select('h1.year').text(next);
  d3.json('data/residence_totals.json', function(error, data){
      c2displaced.datum(data).html(function(d) {return 'Total Hosted: <b>' + (d[next]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
  });
}

var c2player = setInterval(function(){c2nextYear(); }, 750);

function c2playData() {
  c2player = setInterval(function(){c2nextYear(); }, 750);
}

function c2stopData() {
  clearInterval(c2player);
}
