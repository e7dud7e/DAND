//load geojson data of usa and invoke draw function
d3.json("./data/usa_states.json", draw);


/*
 * draw()
 * in: geo_json data of the united states
 * out: draws map of USA and calls other functions
 *    to display airport data over multiple years
*/

function draw(geo_data) {
  "use strict";
  var margin = 35,
      width = 1400 - margin,
      height = 900 - margin;

  var light_gray = "rgb(220,220,220)"
  var title_text = "Average Airport departure delays increase <br/> \
          as total flights per year increase. \
          Year ";

  var number_format_float = d3.format(",.1f");
  var number_format_int = d3.format(",.0f");

  //milliseconds between updating to the next year's data
  var interval_fast = 500; 
  var interval_slow = 1500;
  
  //add title
  d3.select("body")
      .append("h2")
      .html(title_text)

  //add canvas
  var svg = d3.select("body")
      .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
      .append('g')
      .attr('class', 'map');

  //albersUSA relocates Alaska and Hawaii for easier viewing
  var projection = d3.geo.albersUsa()
                    .translate([520,340]);

  var path = d3.geo.path().projection(projection);

  //Draw map of the USA
  var map = svg.selectAll('path')
               .data(geo_data.features)
               .enter()
               .append('path')
               .attr('d', path)
               .style('fill', light_gray)
               .style('stroke', 'black')
               .style('stroke-width', 0.5);

  
  //load airport data and draw airports
  d3.csv("./data/flight_data_yearly_geo.csv", function(d){

    d['Year'] = +d['Year']; //convert to number
    d['Longitude'] = +d['Longitude'];
    d['Latitude'] = +d['Latitude']; 
    d['ArrDelay_mean'] = +d['ArrDelay_mean'];
    d['ArrDelay_max'] = +d['ArrDelay_max'];
    d['ArrDelay_cum'] = +d['ArrDelay_cum'];
    d['ArrDelay_count'] = +d['ArrDelay_count'];
    d['DepDelay_mean'] = +d['DepDelay_mean'];
    d['DepDelay_max'] = +d['DepDelay_max'];
    d['DepDelay_cum'] = +d['DepDelay_cum'];
    d['DepDelay_count'] = +d['DepDelay_count'];

    //Note, I can't create new fields when loading data
    //If I try to, the data passed to the draw function
    //will be null

    return d;
  }, draw_airports);
  
  /*
  * draw_airports()
  * in:
  * data: airport data, including:
  *    Year: the data is aggregated by year
  *    Longitude: use to plot airport location
  *    Latitude: use to plot airport location
  *    Origin: 3 code for airport of departure
  *    Name: full name of airport
  *    City: city where airport is located
  *    DepDelay_count: number of flights that year
  *    DepDelay_mean: average delay in minutes
  *    DepDelay_max: longest delay of that year
  *    
  *  output: draws airports and legends
  */
  function draw_airports(data){

    //convert longitude and latitude 
    // to pixel x,y locations
    var data_coords = data.map(function(d){

      try {
        var coordinates = projection([d['Longitude'],
                                      d['Latitude']]);
        d['x'] = coordinates[0];
        d['y'] = coordinates[1];  
      } catch (err) {
          console.log("error when projecting coordinates");
          console.log(d)
      }
      return d;
    }); //end data_coords

    var radius = get_radius_func(data_coords);
    draw_legend_color();
    draw_legend_size(radius);
    
    /*
       Define the div for the tooltip
     outside of update function
     to ensure that tooltip is invisible
     when mouse is not over the bubble
     If div is local to update(), 
     tooltip will stay visible during animation
    */
    var tool_tip = d3.select("body")
              .append("div")	
              .attr("class", "tooltip")				
              .style("opacity", 0);
    
    play_animation(interval_fast, data_coords, radius, tool_tip);
        
  } //end draw_airports()

  /*
  * play_animation
  * in:
  *   interval_period in milli-seconds
  *   data_coords: airport data including x,y coordinates
  *   radius: function that converts number of flights to circle radius
  *   tool_tip: tool_tip that appears when pointer hovers over airport
  * out: animates the data across multiple years
  */
    function play_animation(interval_period, 
                             data_coords, 
                             radius, 
                             tool_tip){
      
      var years = [];
      for (var i = 1987; i <= 2008; i++){
        years.push(i);
      }
      var year_i = 0;
      var transition_period = interval_period / 2;

      //make sure year buttons are hidden for animation
      d3.select("body")
        .selectAll("div.years_buttons")
        .remove()

      /*
        set interval to iterate over years
      */
      var year_interval = setInterval(function(){
          update(years[year_i], data_coords, radius, tool_tip);
          year_i++;
          if (year_i >= years.length) {
            clearInterval(year_interval);

            var replay_speeds = [
              {"label" : "replay (fast)",
               "interval_period": interval_fast
              },
              {"label" : "replay (slow)",
               "interval_period": interval_slow
              }
            ];

            //add replay button
            var replay = d3.select("body")
                .append("div")
                .attr("class", "replay_buttons")
                .selectAll("div")
                .data(replay_speeds)
                .enter()
                .append("div")
                .style("color", "black")
                .style("background", light_gray)
                .text(function(d){
                  return d['label'];
                })


            replay.on("click", function(d){
              d3.select(this)
                .style("background", "lightblue")
                .style("color", "white");

              d3.selectAll(".replay_buttons div")
                .on("click", function(d){
                    return; //disable click during animation
                  })
              
              play_animation(d['interval_period'], 
                             data_coords,
                             radius,
                             tool_tip);
            })

            //add buttons to select years
            var buttons = d3.select("body")
                    .append("div")
                    .attr("class", "years_buttons")
                    .selectAll("div")
                    .data(years)
                    .enter()
                    .append("div")
                    .style("color", "black")
                    .style("background", light_gray)
                    .text(function(d) {
                        return d;
                    });

            buttons.on("click", function(d) {
                d3.select(".years_buttons")
                  .selectAll("div")
                  .transition()
                  .duration(transition_period)
                  .style("color", "black")
                  .style("background", light_gray);

                d3.select(this)
                  .transition()
                  .duration(transition_period)
                  .style("background", "lightBlue")
                  .style("color", "white");
                update(d, data_coords, radius, tool_tip);
            });                
          }
        }, interval_period);
    } //end play_animation
  
  
  
  /**
    * update
    * in: year (int)
    * out: refreshes airport bubbles with data for the given year
    */
    function update(year, data_coords, radius, tool_tip){
      
      var data_one_year = data_coords.filter(function(d){
        return d['Year'] === year
      });

      d3.select("h2")
          .html(title_text + year)
      
      //remove old circles and add fresh circles
      svg.selectAll('circle.airport').remove();

      svg.selectAll('circle.airport')
          .data(data_one_year.sort(function(a,b){
              return  b['DepDelay_count'] - 
                      a['DepDelay_count'];
            }))
          .enter()
          .append("circle")
          .attr("class", "airport")
          .attr('cx', function(d){ return d['x']; })
          .attr('cy', function(d){ return d['y']; })
          .attr('r', function(d){
                  return radius(d['DepDelay_count']);
                })
          .on("mouseover", function(d) {		
            tool_tip.transition()		
              .duration(200)		
              .style("opacity", 0.9)
            tool_tip.html("City: " + d['City'] + "<br/>" +
                      "Airport: " + d['Origin'] + "<br/>" +
                      d['Name'] + "<br/>" +
                      "Delay average: " + 
                        number_format_float(d['DepDelay_mean']) + 
                          " minutes<br/>" +
                      "Longest delay: " + 
                        number_format_float(d['DepDelay_max'] / 60) + 
                          " hours <br/>" +
                      "Number of flights: " + 
                        number_format_int(d['DepDelay_count']) + 
                          "<br/>" +
                      "Year: " + d['Year']
                     )	
              .style("left", (d3.event.pageX +10) + "px")
              .style("top", (d3.event.pageY +5) + "px");	

              //modify circle to emphasize it
            d3.select(this)
              .style("opacity", 1)
              .style("stroke", "white")
              .style("stroke-width", 2)
            })				
          .on("mouseout", function(d) {		
            tool_tip.transition()		
              .duration(200)
              .style("opacity", 0);

            d3.select(this)
              .style("opacity", 0.5)
              .style("stroke", "black")
              .style("stroke-width", 0.7)
          })
          .style('fill', airport_color)
          .style('stroke-width', 0.7)
          .style('stroke', "black")
          .style('opacity', 0.5)
          .transition()
          .duration(200);

      //note that I have to put the .on chained
      //before the .transition and .duration,
      //otherwise I get an TypeError that "on is not a function"
    } //end update()
  
  /*
  * airport_color
  * in: departure delay (int)
  * out: string representing the color for the delay range
  */
  //set circle color based on delay range
  function airport_color(d) {
    if( d['DepDelay_mean'] <=0){
      return "green";
    } else if(d['DepDelay_mean'] <=5){
      return "yellow";
    } else if(d['DepDelay_mean'] <=10){
      return "orange";
    } else{
      return "red";
    }
  } //end airport_color()

  /*
    get_radius_func
    in
      data: airport flight data
          DepDelay_count has number of flights per year
    out: returns a radius function
          which converts number of flights to circle radius
  */
  function get_radius_func(data){
    var flight_count_upper = 
      d3.max(data,function(d){
        return d['DepDelay_count'];
      });

    var flight_count_lower = 
      d3.min(data,function(d){
        return d['DepDelay_count'];
      });

    var radius = d3.scale.sqrt()
                .domain([flight_count_lower,
                        flight_count_upper])
                .range([3,30])

    return radius;
  } //end get_radius_func
  
  /*
  * draw_legend_color
  * in: none
  * out: draws legend that matches color with delay range
  */
  function draw_legend_color(){
        //Legend matches delay ranges to colors
    var legend_data = [
                      "Early or on time", 
                      "5 minute delay or less", 
                      "5 to 10 minute delay", 
                      "10 minute delay or more"];

    var legend_color = svg.append("g")
        .attr("class", "legend_color")
        .attr("transform", "translate(" + (250) + "," + 600 + ")")
        .selectAll("g")
        .data(legend_data)
        .enter()
        .append("g");

    legend_color.append("circle")
        .attr("class", "legend_color")
        .attr("cy", function(d, i) {
            return i * 25;
        })
        .attr("r", 10)
        .style("opacity", 0.5)
        .style("stroke", "black")
        .style("stroke-width", 0.7)
        .attr("fill", function(d) {
            if (d == "Early or on time") {
                return 'green';
            } else if (d == "5 minute delay or less") {
                return 'yellow';
            } else if (d == "5 to 10 minute delay"){
              return 'orange';
            } else if (d == "10 minute delay or more"){
              return 'red';
            }
        });

    legend_color.append("text")
        .attr("y", function(d, i) {
            return i * 25 + 5;
        })
        .attr("x", 20)
        .text(function(d) {
            return d;
        });
  } //end draw_legend_color
  
  /*
      Legend matches number of flights per year
      to circle size.
      inputs:
        radius: function to convert 
          number of flights to circle radius
  */
  function draw_legend_size(radius){  
    var legend_size_data = ["5000",
                            "50000",
                            "100000",
                            "200000",
                            "400000"
                           ]

    var legend_size = svg.append("g")
          .attr("class", "legend_size")
          .attr("transform", "translate(" + 550 + "," + 560 + ")")
          .selectAll("g")
          .data(legend_size_data)
          .enter()
          .append("g")

    legend_size.append("circle")
          .attr("class", "legend_size")
          .attr("cy", function(d,i){
              return Math.max(Math.pow(radius(d), 1.5), i*35);
          })
          .attr("r", function(d){
              return radius(d);
          })
          .attr("fill", "rgb(240,240,240)")
          .style("opacity", 0.5)
          .style("stroke", "black")
          .style("stroke-width", 0.7)

    legend_size.append("text")
          .attr("y", function(d,i) {
              return Math.max(Math.pow(radius(d), 1.5), i*35);
            })
          .attr("x", 40)
          .text(function(d){
            return number_format_int(d) + 
              " flights/year";
            });
  } //end draw_legend_size
}; //end draw() function