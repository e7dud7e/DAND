# Data Analyst Nanodegree
## Overview of projects

This is an overview of data analysis projects that I completed for the Udacity Data Analyst Nanodegree.

[//]: # (Image References)

[img_titanic]: ./data_titanic/img_titanic.png "titanic"
[img_bike]: ./data_analysis_bikeshare/img_bike.png "bike"
[img_R]: ./exploratory_data_analysis_R/EDA_R_loan_data.png "R data"
[img_mongodb]: ./wrangling_mongodb/img_mongodb.png "mongodb"
[img_hypo]: ./hypothesis_testing_stroop/img_hypothesis.png "hypothesis"
[img_d3]: ./visualization_d3/img_d3.png "d3"

## Install

You will also need to have software installed to run and execute a [Jupyter Notebook](http://ipython.org/notebook.html)
If you do not have Python installed yet, it is highly recommended that you install the [Anaconda](http://continuum.io/downloads) distribution of Python, which already has the above packages and more included. Make sure that you select the Python 2.7 installer and not the Python 3.x installer.

Most projects use Python 2.7 and Jupyter notebooks, and the following libraries:

- [NumPy](http://www.numpy.org/)
- [Pandas](http://pandas.pydata.org/)
- [matplotlib](http://matplotlib.org/)
- [scikit-learn](http://scikit-learn.org/stable/)


One project (exploratory_data_analysis_R) uses R and R Studio.

One project (visualization_d3) uses javascript and D3.js

## Analyzing Titanic passenger data
See the jupyter notebook:
data_titanic/titanic passengers and survival.ipynb

- Used pandas dataframes, numpy, and matplotlib to explore data.

![titanic][img_titanic]

## Analyzing bike share data
See jupyter notebook:
data_analysis_bikeshare/Bay_Area_Bike_Share_Analysis.ipynb

- Used pandas, numpy, matplotlib to explore data.

![bike][img_bike]

## Exploratory Data Analysis in R
See the pdf file:
exploratory_data_analysis_R/Exploration_of_loan_data.pdf

Or in RStudio, open the R markdown file:
exploratory_data_analysis_R/Exploration of loan data.Rmd

- Used box-whisker plots, bar and cluster plots to explore loan data.

![r loan data][img_R]

## Data Wrangling with Python, MongoDB

- wrangling_mongodb/data wrangling map data audit.ipynb: This uses regular expressions to audit Open Street Map data to find irregularities with addresses.
- wrangling_mongodb/data wrangling cleaning.ipynb: this cleans the data and saves it in json format.
- wrangling_mongodb/data wrangling mongodb.ipynb: this imports the cleaned json data into MongoDB and runs queries on the data to explore and plot.

Here is a sample query and plot:
```
#least number of node references per way
query=[{"$match": {"type":"way"}},
       {"$unwind": "$node_refs"},
       {"$group": {"_id": {"id":"$id"},
                   "node_count": {"$sum": 1}}},
       {"$sort": {"node_count": 1}},
       {"$project": {"_id":0,"node_count":1}}
      ]
cursor = db.berkeley.aggregate(query)
result = [c['node_count'] for c in cursor]
node_count_arr = np.array(result)


plt.hist(node_count_arr,bins=40,range=(0,40));
plt.title('99% of ways reference 14 or fewer nodes');
plt.xlabel("number of nodes referenced by way");
plt.ylabel("count of ways");
```
![mongodb][img_mongodb]

## Hypothesis Testing
See:
hypothesis_testing_stroop/Statistics and the Stroop Effect.ipynb

- Conducted a one-sided t-test to show that two groups are statistically significantly different.

![hypothesis][img_hypo]

## Machine Learning for classification
See: machine_learning_enron/poi_id documentation.ipynb

- Used scikit-learn to try various classification algorithms, to determine persons of interest in Enron data.  Used Adaboost, SVM, Decision Trees, PCA.

## Visualization using D3.js
### Install and Run instructions
- Run a local server in the directory of the project, visualization_d3. In a terminal (command line):

For Python 2
```
python -m SimpleHTTPServer
```

For Python 3
```
python3 -m http.server
```
The default port is 8000
- Next, in a web browser url, go to localhost:8000

This should open the index.html file and show the map visualization.
![img d3][img_d3]

- The map of the United States animates the airport traffic and flight delays over a number of years.  After the animation stops, the user can click on the years and hover the mouse over the airport bubbles to interact with the map.


## AB Testing for a web page change
See the pdf file: AB_testing/ProjectABTesting.pdf for the experiment design and analysis of results.