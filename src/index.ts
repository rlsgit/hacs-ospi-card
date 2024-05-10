import { defaults, DEV_MODE } from './constants'
import { type CardElementType } from './types'

declare global {
	interface Window {
		customCards: Array<Object>
	}
}

window.customCards = window.customCards || []

function loadCard(cardElement: CardElementType) {
	DEV_MODE && console.log(`${cardElement.name} ${defaults.version} loaded...`)
	window.customCards.push(cardElement)
}

import { OSPiStationCardElement } from './stationcard/index'
loadCard(OSPiStationCardElement)

import { OSPiSystemCardElement } from './systemcard/index'
loadCard(OSPiSystemCardElement)
