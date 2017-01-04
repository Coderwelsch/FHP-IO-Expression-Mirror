const
	Extend = require( "extend" ),
	Weather = require( "weather-js" );

class WeatherCheck {
	constructor ( settings = {} ) {
		this.settings = {
			location: "Potsdam, Deutschland",
			degreeType: "C",
			updateInterval: 30 * 360000
		};

		this.weatherData = [];

		Extend( true, this.settings, settings );
	}

	getWeather ( callback = null ) {
		Weather.find( {
			search: this.settings.location,
			degreeType: this.settings.degreeType
		}, ( error, data ) => {
			if ( !error || error === null ) {
				this.weatherData = data.length ? data[ 0 ] : this.weatherData;
			}

			callback( error, this.weatherData );
		} );
	}

	startWeatherIntervalUpdate ( callback = null ) {
		// reset interval
		this.stopWeatherIntervalUpdate();

		// set interval
		this.interval = setInterval( () => {
			this.getWeather( callback );
		}, this.settings.updateInterval );

		// get initial weather data
		this.getWeather( callback );
	}

	stopWeatherIntervalUpdate () {
		if ( !this.interval ) {
			clearInterval( this.interval );
		}
	}
}

module.exports = WeatherCheck;