import { defaults, DEV_MODE } from './constants'
import { type CardElementType } from './types'

declare global {
	interface Window {
		customCards: Array<Object>
	}
}

window.customCards = window.customCards || []

function loadCard(cardElement: CardElementType) {
	const el: CardElementType = cardElement

	if (DEV_MODE) {
		el.type = `${el.type}-dev`
		;(el.name = `${el.name}-dev`), console.log(`${el.name} ${defaults.version} loaded...`)
	}

	window.customCards.push(el)
}

import { OSPiStationCardElement } from './stationcard/index'
loadCard(OSPiStationCardElement)
