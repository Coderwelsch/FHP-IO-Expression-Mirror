import cv2 as OpenCV
import glob
import random
import os
import numpy as np

fishface = OpenCV.face.createFisherFaceRecognizer()
currentDir = os.path.dirname( os.path.abspath( __file__ ) ) + "/"
data = {}

def make_sets(emotions):
	training_data = []
	training_labels = []

	for emotion in emotions:
		training = training = glob.glob( currentDir + "data/dataset/%s/*" % emotion )

		for item in training:
			image = OpenCV.imread( item )
			gray = OpenCV.cvtColor( image, OpenCV.COLOR_BGR2GRAY )
			training_data.append( gray )
			training_labels.append( emotions.index( emotion ) )

	return training_data, training_labels

def run_recognizer(emotions):
	training_data, training_labels = make_sets(emotions)

	print("training fisher face classifier")
	print("size of training set is: " + str(len(training_labels)) + " images")
	fishface.train(training_data, np.asarray(training_labels))

def update( emotions ):
	run_recognizer( emotions )
	print("saving model")

	fishface.save( currentDir + "data/cascades/trained_emoclassifier.xml" )
	print("model saved!")
