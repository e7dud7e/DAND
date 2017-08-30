
Summary - in no more than 4 sentences, briefly introduce your data visualization and add any context that can help readers understand it

This visualizes the number of flights originating from each airport and the airport's average departure delay for each year, for domestic flights in the USA.  Circles representing the airports are placed over a map of the USA. The size of the circles represent number of flights departing from that airport for a given year.  The color of the circle represents the range of departure delays per year (or if the average flight was early or on time).

Some observations:

Number of flights increased over time, with reductions during years that coincided with recessions (2001-2, 2008).

Airports with more flights have longer delays.  On-time airports usually process fewer flights.

Years with more delays (2000, 2006, 2007) affect both large and small airports. Delays from each plane can affect more than one airport for multi-stop flights, so delays are correlated across airports.

A small airport's delays can exceed 10 minutes when it's busier compared to previous years, suggesting that the airport is near capacity.


Design - explain any design choices you made including changes to the visualization after collecting feedback

I initially used circle size to represent departure delays, but realized that some airports that processed very few flights (1 per year) but with large delays appeared too prominently as giant circles that disappeared in other years when the airport had no recorded flights.  In order to include both number of flights and delays, I changed the circle size to denote number of flights, and used four color ranges to denote the delay.  Since color gradients are difficult to interpret as a number, I chose four ranges and four distinct colors, to make the delays easier to distinguish from each other.

Some feedback showed that it wasn't clear what the circle size or color represented, so I included legends for both number of flights (color size) and departure delays (color).

I added tool tips for each airport, which includes the airport name, city, number of flights, average and longest delay, and year. I got feedback that since the circles overlap, it's hard to know which circle the tool tip represents unless the circle is hi-lighted.  I updated the mouse-over so that the selected circle is opaque and outlined in a white line.

Some feedback I got was that there are so many circles that it's hard to look at all of them at once during the animation.  I added replay buttons in fast and slow speeds to show the change over time multiple times.

One observer said that the changing year in the title was not obvious.  I changed it to a light blue, to contrast with the black static text.

I also had users point out that the year buttons did not look like they were buttons, or that they are interacive.  I made them change color when the mouse hovers over them, and revert back to their original color when the mouse moves away.  So the buttons are more responsive and imply that they are interactive.

Feedback - include all feedback you received from others on your visualization from the first sketch to the final visualization

Person 1:
It’s hard to know which bubble is being displayed when hovering pointer.
Is the number of flights the number of delayed flights?
Is a year too much data to get an average?
How does this help me choose which airport to use?

Person 2:
It’s hard to find a specific airport.
Los Angeles is not as bad as expected.
Airports had worse delays in more recent years.
Thought the size of circles and color both represented delays.

Person 3:
It wasn’t very obvious that the year in the title was changing.

Resources - list any sources you consulted to create your visualization

Person 4:
It's not clear that the year is changing; maybe if it flashes when the year changes, it is more obvious.  

It looks like the replay buttons are related to the specific years, because the buttons are lined up exactly with the first two years' butons.  

It's not clear that the year buttons are buttons.

It's not clear what the floating Alaska was.

Person 5:
It’s not clear that the buttons can be clicked, because the mouse pointer becomes a text icon and the button does not respond when the pointer hovers over it.

The white outline around airport circles is not clear for the yellow circles and for the tiny circles.

Recommends using drop down menu for years instead of individual buttons, for when there are more years to display.

The small circles are hard to see.

Example used to create tool tip
http://bl.ocks.org/d3noob/a22c42db65eb00d4e369

Example of how to handle a clicked or selected object differently than the others.
http://stackoverflow.com/questions/12321352/equivalent-of-jquerys-not-selector-in-d3-js


