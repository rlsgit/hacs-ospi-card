import { defaults } from './constants'

import { OSPiStationCardElement } from './stationcard/index'

console.log(`OSPi StationCard ${defaults.version} loaded...`)

declare global {
	interface Window {
		customCards: Array<Object>
	}
}

window.customCards = window.customCards || []

window.customCards.push(OSPiStationCardElement)
