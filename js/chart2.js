/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */



  /*
   * Callback function that is called after every tick of the
   * force c2simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force c2simulation.
   */
  function c2ticked() {
    c2bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  // Constants for sizing
  var c2width = initialWidth;
  var c2height = 600;

  // tooltip for mouseover functionality
  var c2tooltip = floatingTooltip('bubble_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var c2center = { x: c2width / 2, y: c2height / 2 };

/*
  var yearCenters = {
    2008: { x: width / 3, y: height / 2 },
    2009: { x: width / 2, y: height / 2 },
    2010: { x: 2 * width / 3, y: height / 2 }
  };

  // X locations of the year titles.
  var yearsTitleX = {
    2008: 160,
    2009: width / 2,
    2010: width - 160
  };
*/

  // @v4 strength to apply to the position forces
  //var forceStrength = 0.08;

  // These will be set in create_nodes and create_vis

  var c2svg = null;
  var c2bubbles = null;
  var c2nodes = [];

  // Charge function that is called for each node.
  // As part of the ManyBody force.
  // This is what creates the repulsion between nodes.
  //
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  //
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  //
  // Charge is negative because we want nodes to repel.
  // @v4 Before the charge was a stand-alone attribute
  //  of the force layout. Now we can use it as a separate force!
  /*function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength * 1.2;
  }
  */

  // Here we create a force layout and
  // @v4 We create a force c2simulation now and
  //  add forces to it.
  var c2simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', c2ticked);

  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  c2simulation.stop();

/*
 * This data manipulation function takes the raw data from
 * the CSV file and converts it into an array of node objects.
 * Each node will store data and visualization values to visualize
 * a bubble.
 *
 * c2data is expected to be an array of data objects, read in from
 * one of d3's loading functions like d3.csv.
 *
 * This function returns the new node array, with a node in that
 * array for each element in the c2data input.
 */

 function c2createNodes(c2data, mapYear) {
   // Use the max X2015 in the data as the max in the scale's domain
   // note we have to ensure the X2015 is a number.
   //var maxAmount = d3.max(c2data, function (d) { return +d.X2015; });

   // Sizes bubbles based on area.
   // @v4: new flattened scale names.
   var radiusScale = d3.scalePow()
     .exponent(2)
     .range([0, 155])
     .domain([0, 7632500]);

   // Use map() to convert raw data into node data.
   // Checkout http://learnjsdata.com/ for more on
   // working with data.
   var myNodes = c2data.map(function (d) {
     var columnKey = 'X' + mapYear;
     var column = d[columnKey];
     return {
       id: d.id,
       radius: Math.sqrt(+d[columnKey]*(.00008+initialWidth/1000000)),
       value: +d[columnKey],
       name: d.residence,
       x: Math.random() * 900,
       y: Math.random() * 800
     };
   });

   return myNodes;
 }

 function c2recreateNodes(c2data, mapYear) {
   // Use the max X2015 in the data as the max in the scale's domain
   // note we have to ensure the X2015 is a number.
   //var maxAmount = d3.max(c2data, function (d) { return +d.X2015; });

   // Sizes bubbles based on area.
   // @v4: new flattened scale names.
   var radiusScale = d3.scalePow()
     .exponent(2)
     .range([0, 155])
     .domain([0, 7632500]);

   // Use map() to convert raw data into node data.
   // Checkout http://learnjsdata.com/ for more on
   // working with data.
   var myNodes = c2data.map(function (d) {
     var columnKey = 'X' + mapYear;
     var column = d[columnKey];
     return {
       id: d.id,
       radius: Math.sqrt(+d[columnKey]*(.00008+initialWidth/1000000)),
       value: +d[columnKey],
       name: d.residence,
       x: parseFloat(d3.select('#chart2').select('#c'+d.id).attr('cx')),
       y: parseFloat(d3.select('#chart2').select('#c'+d.id).attr('cy'))
     };
   });

   return myNodes;
 }

 /*
  * Provides a x value for each node to be used with the split by year
  * x force.
  */
 function nodeYearPos(d) {
   return yearCenters[d.year].x;
 }


 /*
  * Sets visualization in "single group mode".
  * The year labels are hidden and the force layout
  * tick function is set to move all nodes to the
  * center of the visualization.
  */
 function c2groupBubbles() {

   // @v4 Reset the 'x' force to draw the bubbles to the center.
   c2simulation.force('x', d3.forceX().strength(forceStrength).x(c2center.x));

   // @v4 We can reset the alpha value and restart the c2simulation
   c2simulation.alpha(1).restart();
 }

 /*
  * Function called on mouseover to display the
  * details of a bubble in the tooltip.
  */
 function c2showDetail(d) {
   // change outline to indicate hover state.
   d3.select(this).attr('stroke', 'white');

   var content = '<span class="name">Residence: </span><span class="value">' +
                 d.name +
                 '</span><br/>' +
                 '<span class="name">Number: </span><span class="value">' +
                 addCommas(d.value) +
                 '</span>';

   c2tooltip.showTooltip(content, d3.event);
 }

 /*
  * Hides tooltip
  */
 function c2hideDetail(d) {
   // reset outline

   d3.select(this)
     .attr('stroke', '#2f1849');

   c2tooltip.hideTooltip();
 }



function c2bubbleChart(mapYear) {

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the c2data for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * c2data is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */

   d3.csv('data/residence.csv', function(error, c2data) {

   // convert raw data into nodes data
   c2nodes = c2createNodes(c2data, mapYear);

   // Create a SVG element inside the provided selector
   // with desired size.
   c2svg = d3.select('#chart2')
     .append('svg')
     .attr('width', c2width)
     .attr('height', c2height);

   // Bind nodes data to what will become DOM elements to represent them.
   c2bubbles = c2svg.selectAll('.bubble')
     .data(c2nodes, function (d) { return d.id; });

   // Create new circle elements each with class `bubble`.
   // There will be one circle.bubble for each object in the nodes array.
   // Initially, their radius (r attribute) will be 0.
   // @v4 Selections are immutable, so lets capture the
   //  enter selection to apply our transtition to below.
   var bubblesE = c2bubbles.enter().append('circle')
     .classed('bubble', true)
     .attr('r', 0)
     .attr('fill', '#d2bee9')
     .attr('stroke', '#2f1849')
     .attr('stroke-width', 1)
     .on('mouseover', c2showDetail)
     .on('mouseout', c2hideDetail);

   // @v4 Merge the original empty selection and the enter selection
   c2bubbles = c2bubbles.merge(bubblesE);

   // Fancy transition to make bubbles appear, ending with the
   // correct radius
   c2bubbles.transition()
     .duration(2000)
     .attr('id', function (d) {return 'c' + d.id;})
     .attr('class', function (d) { return 'bubble r' + d.value; })
     .attr('r', function (d) { return d.radius; });

   // Set the c2simulation's nodes to our newly created nodes array.
   // @v4 Once we set the nodes, the c2simulation will start running automatically!
   c2simulation.nodes(c2nodes);

   // Set initial layout to single group.
   c2groupBubbles();

   });
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

//var myBubbleChart = bubbleChart(2015);

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
 /*
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#chart1', data);
}
*/
/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
 /*
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}
*/
/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */

function c2updateChart(mapYear) {

    d3.csv('data/residence.csv', function(error, c2data) {

        //d3.selectAll('.bubble').remove();

        c2nodes = c2recreateNodes(c2data, mapYear);
        // Bind nodes data to what will become DOM elements to represent them.
        bubbles_new = d3.select('#chart2').selectAll('.bubble')
          .data(c2nodes, function (d) { return d.id; })
          .on('mouseover', c2showDetail)
          .on('mousemove', c2showDetail)
          .on('mouseout', c2hideDetail);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles_new.transition()
          .duration(500)
          .attr('id', function (d) {return 'c' + d.id;})
          .attr('class', function (d) { return 'bubble r' + d.value; })
          .attr('r', function (d) { return d.radius; });

        // Set the c2simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the c2simulation will start running automatically!
        c2simulation.nodes(c2nodes);

        // Set initial layout to single group.
        c2groupBubbles();

    });
}

// Load the data.
//d3.csv('data/origin.csv', display);
c2bubbleChart(2000);

// setup the buttons.
//setupButtons();
