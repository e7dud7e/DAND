#!/usr/bin/python

import sys
import pickle
sys.path.append("../tools/")

import math
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from collections import defaultdict

from sklearn.preprocessing import MinMaxScaler

from feature_format import featureFormat, targetFeatureSplit
from tester import dump_classifier_and_data
from tester import test_classifier



def scale_feature(data_dict, feature, feature_scaled):
    feature_l = [v[feature] for v in data_dict.values() if v[feature] != 'NaN']
    scaler = MinMaxScaler()
    scaler.fit(np.array(feature_l).reshape(len(feature_l),1))
    
    for name, data in data_dict.iteritems():
        if data[feature] == 'NaN':
            data[feature_scaled] = 'NaN'
        else:
            data[feature_scaled] = scaler.transform(np.array([[data[feature]]]))[0][0]
    return data_dict


def compute_ratio(data_dict, numesrator, denominator, ratio):
    for k, v in data_dict.iteritems():
        n = v[numerator]
        d = v[denominator]
        if n == 'NaN' or d == 'NaN' or d == 0:
            data_dict[k][ratio] = 'NaN'
        else:
            data_dict[k][ratio] = float(n) / float(d)

### Task 1: Select what features you'll use (see below)

### Load the dictionary containing the dataset
with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

### Task 2: Remove outliers
data_dict.pop('THE TRAVEL AGENCY IN THE PARK')
data_dict.pop('TOTAL')

### Task 3: Create new feature(s)
#first compute email ratios
ratios_to_compute = [('from_this_person_to_poi', 'from_messages', 'to_poi_ratio'),
                     ('from_poi_to_this_person', 'to_messages', 'from_poi_ratio'),
                     ('shared_receipt_with_poi', 'to_messages', 'shared_poi_ratio')
                    ]

for numerator, denominator, ratio in ratios_to_compute:
    compute_ratio(data_dict, numerator, denominator, ratio)

#then scale compensation, expense, and email ratios
feature_to_scale = ['salary',
                    'total_stock_value',
                     'total_payments',
                     'restricted_stock',
                     'exercised_stock_options',
                     'other',
                     'bonus',
                     'expenses',
                     'to_poi_ratio',
                     'from_poi_ratio',
                     'shared_poi_ratio'
                    ]
for feature in feature_to_scale:
    data_dict = scale_feature(data_dict, feature, feature + '_scaled')

feature_list = ['poi',
                'to_poi_ratio_scaled',
                'bonus_scaled',
                'shared_poi_ratio_scaled'
                ]

### Store to my_dataset for easy export below.
my_dataset = data_dict

### Best estimator found is SVM
C = 1000
gamma = 0.1
clf = SVC(kernel='rbf', class_weight='balanced', C=C, gamma=gamma)
test_classifier(clf=clf, dataset=my_dataset, feature_list=feature_list, folds=1000)

### Task 6: Dump your classifier, dataset, and features_list so anyone can
### check your results. You do not need to change anything below, but make sure
### that the version of poi_id.py that you submit can be run on its own and
### generates the necessary .pkl files for validating your results.

dump_classifier_and_data(clf, my_dataset, feature_list)
