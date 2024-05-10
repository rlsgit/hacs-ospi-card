import { defaults, getDevString } from '../constants'

export const OSPiSystemCardElement = {
	type: getDevString('ospi-systemcard'),
	name: getDevString('OSPi SystemCard'),
	description: getDevString('OpenSprinkler System Card'),
	version: defaults.version
}

export const OSPiSystemCardConfigElement = {
	type: getDevString('ospi-systemcard-editor'),
	name: getDevString('OSPi SystemCard Editor'),
	description: getDevString('OpenSprinkler System Card Confguration Editor'),
	version: defaults.version
}
