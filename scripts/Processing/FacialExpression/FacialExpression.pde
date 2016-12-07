// imports
import processing.video.*;
import gab.opencv.*;
import java.awt.Rectangle;

// variables
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
	opencv.loadCascade( OpenCV.CASCADE_FRONTALFACE );
	
}