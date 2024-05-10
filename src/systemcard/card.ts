import { html, LitElement, TemplateResult, css, PropertyValues, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { mdiPlay, mdiStop, mdiDotsVertical, mdiClose } from '@mdi/js'
import moment from 'moment'

import { HassEntity } from 'home-assistant-js-websocket'

import { OSPiSystemCardConfigElement, OSPiSystemCardElement } from './index'
import { defaults } from '../constants'
import { getCardStyle, getEntities, HomeAssistant } from '../ha_helpers'
import { isEnabled, stateActivated, stateStoppable } from '../os_helpers'

export interface OSPiSystemCardConfig {
	name: string
	showName: boolean
	image?: string
	imageHeight?: number
	imagePosition?: 'cover' | 'contain'
	device?: string
}

@customElement(OSPiSystemCardElement.type)
export default class OSPiSystemCard extends LitElement {
	@property({ attribute: false }) public hass?: HomeAssistant
	@state() private config!: OSPiSystemCardConfig

	// card configuration
	static getConfigElement() {
		return document.createElement(OSPiSystemCardConfigElement.type)
	}

	// lifecycle interface
	setConfig(config: OSPiSystemCardConfig): void {
		if (!config) {
			throw new Error('Invalid configuration')
		}

		this.config = {
			...config
		}
	}

	private cardImage(): TemplateResult {
		let ret = html``

		if (this.config.image) {
			let url = this.config.image
			if (!url.startsWith('http') && !url.startsWith('/')) {
				url = '/local/images/ospi-card/' + url
			}

			const height = `${this.config.imageHeight ? this.config.imageHeight : defaults.imageHeightDefault}px`
			const style = `
        background-image: url('${url}'); 
        height: ${height}; 
        width: 100%;
        background-repeat: no-repeat;
        background-size: ${this.config.imagePosition || 'cover'};
        background-position: center;
        border-top-left-radius: var(--ha-card-border-radius, 12px);
        border-top-right-radius: var(--ha-card-border-radius, 12px);
      `

			ret = html`<div class="card-image" style="${style}"></div>`
		}

		return ret
	}

	private cardName(): TemplateResult {
		if (!this.config.showName) return html``

		let menu = html`
			<mwc-icon-button class="more-info" label="Open more info" @click=${this.menuClick} tabindex="0" style="margin-inline-end: -8px">
				<ha-svg-icon .path=${mdiDotsVertical}></ha-svg-icon>
			</mwc-icon-button>
		`

		return html`
			<div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
				<div style="font-weight: bold; font-size: 24px;">${this.config.name}</div>
				<div style="position: absolute; right: 0;">${menu}</div>
			</div>
		`
	}

	private cardStatus(): TemplateResult {
		let stateText = ''

		const style = `
      display: flex;
      justify-content: center;
      align-items: center;
    `

		const badge = html` ${stateText} `

		return html` <div style="${style}">${badge}</div> `
	}

	private history(): TemplateResult {
		let ret = html``

		// if (this.lastRun === undefined) {
		// 	const sensors = getEntities(this.hass, this.config.device, (entity, state) => {
		// 		if (state && state.attributes.opensprinkler_type === 'station' && state.attributes.index === this.state.attributes.index && entity.entity_id.startsWith('binary_sensor.')) {
		// 			return true
		// 		}
		// 		return false
		// 	})

		// 	const entity = sensors[0]

		// 	this.hass.callApi('GET', `history/period?filter_entity_id=${entity.entity.entity_id}&minimal_response=true&no_attributes=true`).then((data) => {
		// 		// console.log(data)
		// 		const history = data[0]
		// 		for (let index = history.length - 1; index >= 0; index--) {
		// 			if (history[index].state === 'off' && index > 0) {
		// 				const start = moment(history[index - 1].last_changed)
		// 				const stop = moment(history[index].last_changed)
		// 				const duration = moment.duration(stop.diff(start))

		// 				this.lastRun = `Last run: ${start.format('M/D/YY h:mm A')} for ${duration.humanize()}`
		// 				break
		// 			}
		// 		}
		// 	})
		// }

		// return html`<div style="text-align: center; font-style: italic;">${this.lastRun}</div>`

		return ret
	}

	render() {
		if (!this.config) return nothing

		// this.state = getEntityState(this.hass, this.config.station)

		return html` <ha-card style="${getCardStyle()}"> ${this.cardImage()} ${this.cardName()} ${this.cardStatus()} ${this.history()} </ha-card> `
	}

	public connectedCallback(): void {
		super.connectedCallback()

		// this.runtimeDialog = new OSPiCardRuntimeDialog()
		// document.body.appendChild(this.runtimeDialog)
	}

	public disconnectedCallback(): void {
		super.disconnectedCallback()

		// document.body.removeChild(this.runtimeDialog)
	}

	private menuClick() {
		// fireEvent(this, 'hass-more-info', { entityId: this.config.station })
	}

	private actionClick(action: 'run' | 'stop') {
		// if (action === 'stop') {
		// 	this.hass.callService('opensprinkler', action, { entity_id: this.config.station })
		// } else {
		// 	this.runtimeDialog.show({
		// 		runAction: (runtime) => {
		// 			//@ts-ignore TODO
		// 			this.hass.callService('opensprinkler', action, { entity_id: this.config.station, run_seconds: runtime })
		// 		}
		// 	})
		// }
	}

	protected shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) return false
		if (changedProps.has('config')) return true

		const oldHass = changedProps.get('hass') as HomeAssistant | undefined
		if (!oldHass) return true

		// if (oldHass.states[this.config.station] !== getEntityState(this.hass, this.config.station)) return true

		return false
	}

	// private getStateIcon(enabled: boolean): string {
	// 	if (!enabled) return this.config.icons.idle_disabled

	// 	if (stateActivated(this.state)) return this.config.icons.active

	// 	return this.config.icons.idle
	// }

	static styles = [
		css`
			.progress-container {
				background-color: gray;
				border-radius: 5px;

				margin-left: 10%;
				margin-right: 10%;
				margin-bottom: 10px;

				height: 10px;
			}

			.progress-progress {
				background-color: green;
				border-radius: 5px;

				padding: 1px;

				height: 8px;
				width: 0%;
			}

			@keyframes progress-animate {
				to {
					width: 100%;
				}
			}
		`
	]
}
