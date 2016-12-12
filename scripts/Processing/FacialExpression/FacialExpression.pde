// imports
import processing.video.*;
import gab.opencv.*;
import java.awt.Rectangle;

// variables
String cascadeDir = dataPath( "cascades/" );
String faceCascade = cascadeDir + "haarcascade_frontalface_default.xml";
OpenCV opencv;
Capture camera;
Rectangle faces[];


void setup () {
	size( 800, 600, P2D );

	initCamera();
	initOpenCV();
}

void initCamera () {
	camera = new Capture( this, width, height );
	camera.start();
}

void initOpenCV () {
	opencv = new OpenCV( this, width, height );
	opencv.loadCascade( faceCascade );
	
}

void captureEvent ( Capture camera ) {
	camera.read();
}

void draw () {
	opencv.loadImage( camera );
	detectFaces();
}

void detectFaces () {
    Rectangle currentFace = null;
	faces = opencv.detect();
	image( camera, 0, 0 );

	if ( faces != null ) {
		for ( int i = 0; i < faces.length; i++ ) {
    		currentFace = faces[ i ];
    
			strokeWeight( 1 );
			stroke( 255, 128, 0 );
			noFill();
			rect( currentFace.x, currentFace.y, currentFace.width, currentFace.height );
		}
	}
}