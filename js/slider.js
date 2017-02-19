var slidermargin = {right: 50, left: 50},
    sliderwidth = parseInt(d3.select('div#chart1').style('width')),
    sliderheight = 100;

var slidersvg = d3.select('div.slider').append('svg')
    .attr('width',sliderwidth)
    .attr('height',sliderheight);

var sliderx = d3.scaleLinear()
    .domain([2000, 2015])
    .range([0, sliderwidth - slidermargin.right*2])
    .clamp(true);

var slider = slidersvg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + slidermargin.left + "," + sliderheight / 2 + ")");

d3.select('#chart1').select('h1.year').html('2000');

slider.append("line")
    .attr("class", "track")
    .attr("x1", sliderx.range()[0])
    .attr("x2", sliderx.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
            updateChart(sliderx.invert(d3.event.x).toFixed(0));
            handle.attr('cx',d3.event.x);
            d3.select('h1.year').html(sliderx.invert(d3.event.x).toFixed(0));
            var currentYear = sliderx.invert(d3.event.x).toFixed(0);
            d3.json('data/origin_totals.json', function(error, data){
                displaced.datum(data).html(function(d) {return 'Total Displaced: <b>' + (d[currentYear]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
            });
        }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 24 + ")")
  .selectAll("text")
  .data(sliderx.ticks(16))
  .enter().append("text")
    .attr("x", sliderx)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; console.log(d);});

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

/*
slider.transition().delay(2000) // Gratuitous intro!
    .duration(7500)
    .tween("hue", function() {
      var i = d3.interpolate(2000, 2015);
      return function(t) { updateChart(i(t).toFixed(0)); };
  });
*/
var displaced = d3.select('h2.displaced');

d3.json('data/origin_totals.json', function(error, data){ displaced.datum(data).html(function(d) {return 'Total Displaced: <b>' + (d[2000]['FIELD2']/1000000).toFixed(1) + 'M</b>';})});

function nextYear() {
  var current = sliderx.invert(handle.attr('cx')).toFixed(0);
  var next = +current + 1;
  if (current >= 2014) {stopData();}
  if (next == 2016) {next = 2000;}
  handle.transition().duration(250).attr('cx', sliderx(next));
  updateChart(next);
  d3.select('h1.year').text(next);
  d3.json('data/origin_totals.json', function(error, data){
      displaced.datum(data).html(function(d) {return 'Total Displaced: <b>' + (d[next]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
  });
}

function prevYear() {
  var current = sliderx.invert(handle.attr('cx')).toFixed(0);
  var next = +current - 1;
  if (current <= 2001) {stopData();}
  if (next == 1999) {next = 2015;}
  handle.transition().duration(250).attr('cx', sliderx(next));
  updateChart(next);
  d3.select('h1.year').text(next);
  d3.json('data/origin_totals.json', function(error, data){
      displaced.datum(data).html(function(d) {return 'Total Displaced: <b>' + (d[next]['FIELD2']/1000000).toFixed(1) + 'M</b>';});
  });
}

var player = setInterval(function(){nextYear(); }, 750);

function playData() {
  player = setInterval(function(){nextYear(); }, 750);
}

function stopData() {
  clearInterval(player);
}
