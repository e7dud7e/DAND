//load geojson data of usa and invoke draw function
d3.json("./data/usa_states.json", draw);


/**
 * Draws map of USA and calls other functions
 * to display airport data over multiple years
 * @geo_data: geo_json data of the united states
 * @return: None
*/

function draw(geo_data) {
  "use strict";
  var margin = 35;
  var width = 1400 - margin;
  var height = 730 - margin;

  var title_text = 
    "Average Airport Departure Delays are linked to <br/> \
    number of flights originating from the airport.";
  
  var commentary_text = "Observations <br/> \
      Number of flights increased over time, with reductions during years that coincided with recessions (2001-2, 2008). <br/>\
      Large airports with more flights have longer delays.  On-time airports are usually smaller and process fewer flights. <br/> \
      Years with more delays (2000, 2006, 2007) affect both large and small airports. Delays from each plane can affect more than one airport for multi-stop flights, so delays are correlated across airports. <br/> \
      A small airport's delays can exceed 10 minutes when it's busier compared to previous years, suggesting that the airport is near capacity. <br/>\
      ";

  var number_format_float = d3.format(",.1f");
  var number_format_int = d3.format(",.0f");

  //milliseconds between updating to the next year's data
  var interval_fast = 1000; 
  var interval_slow = 2000;
  
  //colors for delay ranges
  var range_color = 
    [
      "green",
      "yellow", 
      "orange", 
      "red"
    ];
  
  //buttons for each year change color when
  //clicked or mouse hovers over them
  var button_color = {
    "mouseout":
      {
        "background": "lightgray",
        "color": "black"
      },
    "mouseover":
      {
        "background": "blanchedalmond",
        "color": "black"
      },
    "click":
      {
        "background": "blanchedalmond",
        "color": "darkblue",
        "font-weight": "bold"
      },
    "nonclick":
      {
        "background": "lightgray",
        "color": "black",
        "font-weight": "normal"
      }
  };
  
  //add title
  d3.select("body")
    .append("h2")
    .attr("class", "title")
    .html(title_text)
    .append("h2")
    .attr("class", "year");
  
  //add commentary
  var commentary = d3.select("body")
    .append("div")
    .attr("class", "commentary")
    .html(commentary_text);
  
  //add canvas
  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)
    .append('g')
    .attr('class', 'map');

  //albersUSA relocates Alaska and Hawaii for easier viewing
  var projection = d3.geo.albersUsa().translate([520,340]);

  var path = d3.geo.path().projection(projection);

  //Draw map of the USA
  var map = svg.selectAll('path')
    .data(geo_data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', "lightgray")
    .style('stroke', 'black')
    .style('stroke-width', 0.5);

  
  //load airport data and draw airports
  d3.csv("./data/flight_data_yearly_geo.csv", 
    function(d){
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
      return d;
      /*Note, I can't create new fields when loading data
        If I try to, the data passed to the draw function
        will be null */
    },draw_airports);
  

  /**
  * Draw airports and legends
  * 
  * @data: airport data, including:
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
  *  @return: None
  */
  function draw_airports(data){
    //convert longitude and latitude 
    // to pixel x,y locations
    var data_coords = data.map(
      function(d){
        try {
          var coordinates =
            projection([d['Longitude'],d['Latitude']]);
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
    var tool_tip = 
      d3.select("body")
        .append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
    
    play_animation(interval_fast, data_coords, radius, tool_tip);
  } //end draw_airports()

  /**
  * Shows data for each year from 1987 to 2008
  * 
  * @interval_period: time to wait for each 
  *   year's data to display in milli-seconds
  * @data_coords: airport data including x,y coordinates
  * @radius: function that converts number of flights 
  *   to circle radius
  * @tool_tip: text that appears when pointer hovers over airport
  * @return: None
  */
    function play_animation(interval_period, 
      data_coords, radius, tool_tip){
      var years = [];
      for (var i = 1987; i <= 2008; i++){
        years.push(i);
      };
      
      //make sure year buttons are hidden for animation
      d3.select("body")
        .selectAll("div.years_buttons")
        .remove()

      // set interval to iterate over years
      var transition_period = 300;
      var year_i = 0;
      var year_interval = setInterval(
        function() {
          update(years[year_i], data_coords, radius, tool_tip);
          year_i++;
          if (year_i >= years.length) {
            //stop animation
            clearInterval(year_interval);

            //add replay buttons
            var replay_speeds = 
            [
              {
                "label" : "replay <br/> (fast)",
                "interval_period": interval_fast
              },
              {
                "label" : "replay <br/> (slow)",
                "interval_period": interval_slow
              }
            ];

            var replay = d3.select("body")
              .append("div")
              .attr("class", "replay_buttons")
              .selectAll("div")
              .data(replay_speeds)
              .enter()
              .append("div")
              .style("color", "black")
              .style("background",
                button_color['mouseout']['background'])
              .style("font-weight",
                button_color['nonclick']['font-weight'])
              .html(function(d){return d['label'];})

            replay.on("mouseover",
              function(d){
                d3.selectAll(".replay_buttons")
                  .selectAll("div")
                  .style("background", 
                    button_color['mouseout']['background']);

                d3.select(this)
                  .style("background", 
                    button_color['mouseover']['background']);
              }
            );
            
            replay.on("mouseout", 
              function(d){
                d3.selectAll(".replay_buttons")
                  .selectAll("div")
                  .style("background", 
                    button_color['mouseout']['background'])
              }
            );
            
            replay.on("click",
              function(d){
                d3.select(this)
                  .style("color", 
                    button_color['click']['color'])
                .style("background", 
                    button_color['click']['background'])
                .style("font-weight", 
                    button_color['click']['font-weight']);
              
                //disable mouse response during replay
                d3.selectAll(".replay_buttons div")
                  .on("click", function(d){return;})
                  .on("mouseover", function(d){return;})
                  .on("mouseout", function(d){return;})
                
                play_animation(d['interval_period'],
                             data_coords,
                             radius,
                             tool_tip);
              }
            );
            
            //add buttons to select years
            var buttons = d3.select("body")
              .append("div")
              .attr("class", "years_buttons")
              .selectAll("div")
              .data(years)
              .enter()
              .append("div")
              .style("color", "black")
              .style("background",
                button_color['nonclick']['background'])
              .style("font-weight",
                button_color['nonclick']['font-weight'])
              .text(function(d) {return d;});

            buttons.on("mouseover",
              function(d){
                d3.select(this)
                  .style("background",
                    button_color['mouseover']['background'])
              }
            );
            
            buttons.on("mouseout",
              function(d){
                d3.select(this)
                  .style("background",
                    button_color['mouseout']['background'])
              }
            );
            
            buttons.on("click",
              function(d) {
                var clickedButton = this;
              
                //reset style of all buttons
                d3.select(".years_buttons")
                  .selectAll("div")
                  .transition()
                  .duration(transition_period)
                  .style("color",
                        button_color['nonclick']['color'])
                  .style("background",
                        button_color['nonclick']['background'])
                  .style("font-weight",
                        button_color['nonclick']['font-weight']);

                //re-enable mouseout for all buttons
                //except for the one that was clicked
                d3.select(".years_buttons")
                  .selectAll("div")
                  .on("mouseout", function(d){
                    if(this != clickedButton){
                        d3.select(this)
                          .style("background",
                            button_color['mouseout']['background'])
                      }
                    });

                //change style of clicked button
                d3.select(clickedButton)
                  .transition()
                  .duration(transition_period)
                  .style("color",
                        button_color['click']['color'])
                  .style("background",
                        button_color['click']['background'])
                  .style("font-weight",
                        button_color['click']['font-weight']);

                //disable mouseout for this button after click
                d3.select(clickedButton)
                  .on("mouseout", function(d){ return; });

                update(d, data_coords, radius, tool_tip);
              } //end function for "click"
            ); //end buttons.on("click"...)
          } //end if (years_i >= years.length)
        }, interval_period); //end setInterval
    } //end play_animation
  
  /**
    * Updates the map with data for a given year
    * @year: filter data and display for this year
    * @data_coords: data that includes x,y coordinates 
    *   of airport.
    * @radius: function that converts number of flights to
    *   circle radius.
    * @tool_tip: displays text when mouse hovers over an airport
    * @return: None
    */
    function update(year, data_coords, radius, tool_tip){
      
      var data_one_year = data_coords.filter(
        function(d){
          return d['Year'] === year
        }
      );
      
      var year_title = d3.select("h2.year");
      
      year_title.html("Year " + year)
        .transition()
        .duration(500)
        .style("opacity", "1")
        
      //remove old circles and add fresh circles
      svg.selectAll('circle.airport').remove();

      svg.selectAll('circle.airport')
        .data(data_one_year.sort(
          function(a,b){
            return b['DepDelay_count'] - a['DepDelay_count'];
          })
        )
        .enter()
        .append("circle")
        .attr("class", "airport")
        .attr('cx', function(d){ return d['x'];})
        .attr('cy', function(d){ return d['y'];})
        .attr('r',
          function(d){
            return radius(d['DepDelay_count']);
          }
        )
        .on("mouseover",
          function(d){
            tool_tip.transition()
              .duration(200)		
              .style("opacity", 0.9);
        
            tool_tip.html(
              "City: " + d['City'] + "<br/>" +
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
            );
        
            tool_tip.style("left", (d3.event.pageX +10) + "px")
              .style("top", (d3.event.pageY +5) + "px");	

            //modify circle to emphasize it
            d3.select(this)
              .style("opacity", 1)
              .style("stroke", "black")
              .style("stroke-width", 2);
          }
        ) //end .on("mouseover"...)
        .on("mouseout", 
          function(d){		
            tool_tip.transition()		
              .duration(200)
              .style("opacity", 0);

            d3.select(this)
              .style("opacity", 0.5)
              .style("stroke", "black")
              .style("stroke-width", 0.7);
          }
        ) //end .on("mouseout"...)
        .style('fill', airport_color)
        .style('stroke-width', 0.7)
        .style('stroke', "black")
        .style('opacity', 0.5)
        .transition()
        .duration(200);

      /*
      note that I have to put the .on chained
      before the .transition and .duration,
      otherwise I get an TypeError that "on is not a function"
      */      
    } //end update()
  
  /**
  * @d: data for a single airport, including departure delay
  * @return: color to fill the airport based on delay
  */
  //set circle color based on delay range
  function airport_color(d) {
    var range_color_i=3; //if delay >10 minutes
    if(d['DepDelay_mean'] <=0){
      range_color_i = 0;
    } else if(d['DepDelay_mean'] <=5){
      range_color_i = 1;
    } else if(d['DepDelay_mean'] <=10){
      range_color_i = 2;
    }
    return range_color[range_color_i];
  } //end airport_color()

  /**
  *  @data: airport data
  *   DepDelay_count has number of flights per year
  * @return: a radius function that converts 
  *   number of flights to circle radius.
  */
  function get_radius_func(data){
    var flight_count_upper = 
      d3.max(data,
        function(d){
          return d['DepDelay_count'];
        }
      );

    var flight_count_lower = d3.min(data,
      function(d){
        return d['DepDelay_count'];
      }
    );

    var radius = d3.scale.sqrt()
      .domain([flight_count_lower,flight_count_upper])
      .range([5,30]);

    return radius;
  } //end get_radius_func
  
  /**
  * Draws legend that matches color with delay range
  * @return: None
  */
  function draw_legend_color(){
    var legend_data = [
      {
        "label": "Early or on time", 
        "color": range_color[0]
      },
      {
        "label": "5 minute delay or less", 
        "color": range_color[1]
      },
      {
        "label": "5 to 10 minute delay", 
        "color": range_color[2]
      },
      {
        "label": "10 minute delay or more", 
        "color": range_color[3]
      }
    ];

    var legend_color = svg.append("g")
      .attr("class", "legend_color")
      .attr("transform",
        "translate(" + (870) + "," + 300 + ")")
      .selectAll("g")
      .data(legend_data)
      .enter()
      .append("g");

    legend_color.append("circle")
      .attr("class", "legend_color")
      .attr("cy",
        function(d, i){
          return i * 25;
        }
      )
      .attr("r", 10)
      .style("opacity", 0.5)
      .style("stroke", "black")
      .style("stroke-width", 0.7)
      .attr("fill",
        function(d) {
          return d['color'];
        }
      );

    legend_color.append("text")
      .attr("y", 
        function(d, i) {
          return i * 25 + 5;
        }
      )
      .attr("x", 20)
      .text(function(d) {
        return d['label'];
      });
  } //end draw_legend_color
  
  /**
  * Draws legend that matches number of flights per year
  *   with circle sizes.
  * @return: None
  */
  function draw_legend_size(radius){  
    var legend_size_data = 
      [ 
        "5000",
        "50000",
        "100000",
        "200000",
        "400000"
      ];

    var legend_size = 
      svg.append("g")
        .attr("class", "legend_size")
        .attr("transform",
          "translate(" + 870 + "," + 400 + ")")
        .selectAll("g")
        .data(legend_size_data)
        .enter()
        .append("g");

    /*
    * The line spacing needs to increase
    * as the legend circles increase, and also
    * need to be a minimum distance apart.
    * I use the max of a linear and exponential function
    * to space the lines.
    */
    var radius_exponent = 1.53;
    legend_size.append("circle")
      .attr("class", "legend_size")
      .attr("cy",
        function(d,i){
          return Math.max(
            Math.pow(radius(d), radius_exponent),
            i*40);
        }
      )
      .attr("r",
        function(d){
          return radius(d);
        }
      )
      .attr("fill", "rgb(240,240,240)")
      .style("opacity", 0.5)
      .style("stroke", "black")
      .style("stroke-width", 0.7);

    legend_size.append("text")
      .attr("y",
        function(d,i) {
          return Math.max(
            Math.pow(radius(d), radius_exponent),
            i*40);
        }
      )
      .attr("x", 40)
      .text(function(d){
        return number_format_int(d) + 
          " flights/year";
        }
      );
  } //end draw_legend_size
}; //end draw() function