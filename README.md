# IO-Mood-Mirror
A smart mirror project that uses face expression detection to change a users mood.  
_FHP project for the input / output course._

## Dependencies
- [nodejs 6+](https://nodejs.org/en/) and npm
- python 2.7
  - [opencv lib for python](http://www.pyimagesearch.com/2016/11/28/macos-install-opencv-3-and-python-2-7/)
  - [for binary generation you will need nuitka](http://nuitka.net/)

## Install
In the downloaded repo do:
```shell
npm i
```

## Before you could start
Before you could start with the main smart mirror script you should train the face expression script to your face expressions and given environment.  
You can do that by just typing this command in your console and follow the cli instructions to train the face expressions **angry**, **neutral**, **happy**:
```
npm run train
```

## Start the smart mirror script
```shell
npm start
```
