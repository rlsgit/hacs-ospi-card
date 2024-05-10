import { defaults, getDevString } from '../constants'

export const OSPiStationCardElement = {
	type: getDevString('ospi-stationcard'),
	name: getDevString('OSPi StationCard'),
	description: getDevString('OpenSprinkler Station Card'),
	version: defaults.version
}

export const OSPiStationCardConfigElement = {
	type: getDevString('ospi-stationcard-editor'),
	name: getDevString('OSPi StationCard Editor'),
	description: getDevString('OpenSprinkler Station Card Confguration Editor'),
	version: defaults.version
}
