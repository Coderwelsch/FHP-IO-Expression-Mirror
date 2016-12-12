# imports
import cv2 as OpenCV
import glob
from lib import TrainFaces


# variables
videoCapture = None
faceCascade = None
fisherFaceRecognizer = None
croppedFaces = {}
currentFaceFrameIndex = 0

# "settings"
maxCroppedFaces = 10
faceFrameSize = 350
emotions = [ "angry", "happy", "sad", "neutral" ]


def init ():
	initVariables()
	initRunLoop()

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