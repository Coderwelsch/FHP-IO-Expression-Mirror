# imports
import cv2 as OpenCV
import glob
import time as Time
import os
import sys as System
from lib import FaceTraining
import argparse as ArgumentParser


# variables
videoCapture = None
faceCascade = None
fisherFaceRecognizer = None
croppedFaces = {}
currentFaceFrameIndex = 0

# "settings"
maxCroppedFaces = 10
faceFrameSize = 350
emotions = [ "angry", "happy", "neutral" ]

argumentParser = ArgumentParser.ArgumentParser()
argumentParser.add_argument( "--update", help = "Training new faces", action = "store_true" )
arguments = argumentParser.parse_args()


def init ():
	initVariables()
	checkArguments()
	initRunLoop()

def checkArguments ():
	global emotions

	if arguments.update:
		trainingFaces( emotions )
		System.exit(1)

def trainingFaces ( emotions ):
	print( "Updating classifier xml")
	print( "Create folders" )
	makeDirs( emotions )
	
	for i in range( 0, len( emotions ) ):
		saveFace( emotions[ i ] )
	
	print( "Start face training now")
	FaceTraining.update( emotions )
	print( "Done!" )

def saveFace( emotion ):
	global croppedFaces

	print( "\n\nTraining the expression '" + emotion + "' in..." )
	
	for i in range( 0, 5 ):
		print( 5 - i )
		Time.sleep( 1 )

	while len( croppedFaces.keys() ) < maxCroppedFaces - 1:
		print( "Searching faces (" + str( ( maxCroppedFaces - 1 ) - len( croppedFaces.keys() ) ) + " left)" )
		findFaces()

	for x in croppedFaces.keys(): #save contents of dictionary to files
		OpenCV.imwrite( "data/dataset/%s/%s.jpg" % ( emotion, len( glob.glob( "data/dataset/%s/*" % emotion ) ) ), croppedFaces[ x ] )
	
	croppedFaces.clear()

def makeDirs ( emotions ):
	for x in emotions:
		emotionImgDir = "data/dataset/%s" % x

		if os.path.exists( emotionImgDir ):
			pass
		else:
			os.makedirs( emotionImgDir )

def initVariables ():
	global videoCapture, faceCascade, fisherFaceRecognizer

	videoCapture = OpenCV.VideoCapture( 0 )
	faceCascade = OpenCV.CascadeClassifier( "data/cascades/haarcascade_frontalface_default.xml" )
	fisherFaceRecognizer = OpenCV.face.createFisherFaceRecognizer()
	fisherFaceRecognizer.load( "data/cascades/trained_emoclassifier.xml" )

def getProcessedFrame ():
	global videoCapture

	# read video stream
	ret, frame = videoCapture.read()
	
	# convert to gray scaled image
	grayFrame = OpenCV.cvtColor( frame, OpenCV.COLOR_BGR2GRAY )

	# equalize images over 2 seconds 
	histoEqual = OpenCV.createCLAHE( clipLimit = 2.0, tileGridSize = ( 8, 8 ) )
	
	# return history-equalized image ( better brightness )
	return histoEqual.apply( grayFrame )

def cropDetectedFace ( frame, faces ):
	global faceFrameSize, currentFaceFrameIndex

	for ( x, y, width, height ) in faces:
		croppedFace = frame[ y: y + height, x: x + width ]
		croppedFace = OpenCV.resize( croppedFace, ( 350, 350 ) )

	croppedFaces[ "face-" + str( currentFaceFrameIndex ) ] = croppedFace

	if currentFaceFrameIndex >= maxCroppedFaces - 1:
		currentFaceFrameIndex = 0
	else:
		currentFaceFrameIndex += 1

	return croppedFace

def findEmotion ():
	global croppedFaces, fisherFaceRecognizer

	predictions = []
	confidences = []

	for key in croppedFaces.keys():
		frame = croppedFaces[ key ]
		prediction, confidence = fisherFaceRecognizer.predict( frame )

		OpenCV.imwrite( "data/images/" + str( key ) + ".jpg", frame )
		predictions.append( prediction )
		confidences.append( confidence )

	# print max( set( predictions ), key = predictions.count )
	print emotions[ max( set( predictions ), key = predictions.count ) ]

def findFaces ():
	global faceCascade

	processedFrame = getProcessedFrame()
	faces = faceCascade.detectMultiScale( processedFrame, scaleFactor = 1.1, minNeighbors = 15, minSize = ( 10, 10 ), flags = OpenCV.CASCADE_SCALE_IMAGE )

	if len( faces ) >= 1:
		croppedFace = cropDetectedFace( processedFrame, faces )

		# return first face and stop here
		return croppedFace
	else:
		print "No Faces found!"

def draw ():
	findFaces()

	if ( len( croppedFaces ) == maxCroppedFaces ):
		findEmotion()

def initRunLoop ():
	while True:
		draw()

init()