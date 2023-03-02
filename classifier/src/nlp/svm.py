# -*- coding: utf-8 -*-
"""
Created on Wed May 11 16:29:42 2022.

@author: MarinaMatthaiou
"""

# import common libraries
import pandas as pd
from data_processing.data_preprocessing import DataPreprocessing
import os
#import fasttext

class SVM:

    def __init__(self):
        self.labels = ["no hate", "negative stereotyping", "dehumanization", "violence & killing", "equation",
                       "normalization of existing discrimination", "disguise as irony", "harmful slander", "skip"]

    def predict(self, text):
        """
        Predict the class of the new comment.

        In this function we are going to use the pretrained model to the text and
        we predict to which class this text belongs to.

        Parameters
        ----------
        text : List of String
            The text is a list of strings that is going to be classified.
        cv : object
            The vectorizer that is going to transform the text into a vector.
        clf : object
            The clf is the pretrained model that we are going to use in order to
            find the correct class of the text.


        Returns
        -------
        A class according to the pretrained model.

        """

        # import saved model
        #model = fasttext.load_model("C:/Users/Jan Fillies/PycharmProjects/ss22hsbot/models/model_autotuned_41f1.ftz")
       # model = fasttext.load_model("./models/model_autotuned_41f1.ftz")

        #'hate_speech_service'
        #os.path.join(os.path.normpath(os.getcwd() + os.sep + os.pardir),
        #path = os.path.join(('.', 'nlp', 'pretrained_models', 'SVM_Model.pkl')

        path = f'{os.path.dirname(os.path.realpath(__file__))}/SVM_Model.pkl'
        cv, clf = pd.read_pickle(path)

        clean_text = DataPreprocessing.clean_text([text])

        text_svm = cv.transform(clean_text)

        #print("Fasttext: This comment belongs to class " +
        #      model.predict(text)[0][0][0] + ".")

        return int(clf.predict(text_svm)), self.labels[int(clf.predict(text_svm))]
