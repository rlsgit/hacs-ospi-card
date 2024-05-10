import { html, LitElement, TemplateResult, css, PropertyValues, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { mdiPlay, mdiStop, mdiDotsVertical, mdiClose } from '@mdi/js'
import moment from 'moment'

import { HassEntity } from 'home-assistant-js-websocket'

import { OSPiStationCardElement, OSPiStationCardConfigElement } from './index'
import { IconConfig } from '../types'
import { defaults, defaultIcons } from '../constants'
import { fireEvent, getCardStyle, getEntities, getEntityState, HomeAssistant } from '../ha_helpers'
import { isEnabled, stateActivated, stateStoppable } from '../os_helpers'

import OSPiStationCardRuntimeDialog from './runtimedialog'

export interface OSPiStationCardConfig {
	name: string
	showName: boolean
	image?: string
	imageHeight?: number
	imagePosition?: 'cover' | 'contain'
	device?: string
	station?: string

	icons: IconConfig
}

@customElement(OSPiStationCardElement.type)
export default class OSPiStationCard extends LitElement {
	@property({ attribute: false }) public hass?: HomeAssistant
	@state() private config!: OSPiStationCardConfig
	@state() private lastRun?: string

	private state?: HassEntity

	private runtimeDialog?: OSPiStationCardRuntimeDialog

	// card configuration
	static getConfigElement() {
		return document.createElement(OSPiStationCardConfigElement.type)
	}

	// lifecycle interface
	setConfig(config: OSPiStationCardConfig): void {
		if (!config) {
			throw new Error('Invalid configuration')
		}

		this.config = {
			icons: defaultIcons,
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
		const enabled = isEnabled(this.hass, this.state)

		// console.log(this.state)

		let stateText = ''
		if (stateActivated(this.state)) {
			stateText = 'Running'
		} else if (enabled) {
			stateText = 'Idle'
		} else {
			stateText = 'Disabled'
		}
		let state = html`<span>${stateText}</span>`

		const style = `
      display: flex;
      justify-content: center;
      align-items: center;
    `

		const icon = this.getStateIcon(enabled)

		let actions = html``
		if (enabled) {
			if (stateStoppable(this.state)) {
				actions = html` <mwc-button @click=${() => this.actionClick('stop')} .disabled=${!enabled}> <ha-svg-icon .path=${mdiStop}></ha-svg-icon> Stop </mwc-button> `
			} else {
				const inputStyle = 'margin-left: 10px; height: 20px;'
				actions = html` <mwc-button @click=${() => this.actionClick('run')} .disabled=${!enabled}> <ha-svg-icon .path=${mdiPlay}></ha-svg-icon> Run </mwc-button> `
			}
		}

		const badge = html`
			<state-badge .hass=${this.hass} .stateObj=${this.state} .overrideIcon=${icon}></state-badge>
			${state} ${actions}
		`

		return html` <div style="${style}">${badge}</div> `
	}

	private progress(): TemplateResult {
		let ret = html``

		if (this.state.attributes.end_time) {
			let stop = moment(this.state.attributes.end_time)
			let now = moment()
			// let start = moment(this.state.attributes.start_time)
			let remaining = moment.duration(stop.diff(now))

			this.lastRun = ''

			let style = `
        animation: progress-animate ${remaining.asSeconds()}s linear;
        animation-fill-mode: forwards;
      `
			ret = html`<div class="progress-container"><div class="progress-progress" style="${style}"></div></div>`
		} else if (this.lastRun === '') {
			setTimeout(() => {
				this.lastRun = undefined
			}, 2000)
		}

		return ret
	}

	private history(): TemplateResult {
		if (this.lastRun === undefined) {
			const sensors = getEntities(this.hass, this.config.device, (entity, state) => {
				if (state && state.attributes.opensprinkler_type === 'station' && state.attributes.index === this.state.attributes.index && entity.entity_id.startsWith('binary_sensor.')) {
					return true
				}
				return false
			})

			const entity = sensors[0]

			this.hass.callApi('GET', `history/period?filter_entity_id=${entity.entity.entity_id}&minimal_response=true&no_attributes=true`).then((data) => {
				// console.log(data)
				const history = data[0]
				for (let index = history.length - 1; index >= 0; index--) {
					if (history[index].state === 'off' && index > 0) {
						const start = moment(history[index - 1].last_changed)
						const stop = moment(history[index].last_changed)
						const duration = moment.duration(stop.diff(start))

						this.lastRun = `Last run: ${start.format('M/D/YY h:mm A')} for ${duration.humanize()}`
						break
					}
				}
			})
		}

		return html`<div style="text-align: center; font-style: italic;">${this.lastRun}</div>`
	}

	render() {
		if (!this.config) return nothing

		this.state = getEntityState(this.hass, this.config.station)

		return html` <ha-card style="${getCardStyle()}"> ${this.cardImage()} ${this.cardName()} ${this.cardStatus()} ${this.progress()} ${this.history()} </ha-card> `
	}

	public connectedCallback(): void {
		super.connectedCallback()

		this.runtimeDialog = new OSPiStationCardRuntimeDialog()
		document.body.appendChild(this.runtimeDialog)
	}

	public disconnectedCallback(): void {
		super.disconnectedCallback()

		document.body.removeChild(this.runtimeDialog)
	}

	private menuClick() {
		fireEvent(this, 'hass-more-info', { entityId: this.config.station })
	}

	private actionClick(action: 'run' | 'stop') {
		if (action === 'stop') {
			this.hass.callService('opensprinkler', action, { entity_id: this.config.station })
		} else {
			this.runtimeDialog.show({
				runAction: (runtime) => {
					//@ts-ignore TODO
					this.hass.callService('opensprinkler', action, { entity_id: this.config.station, run_seconds: runtime })
				}
			})
		}
	}

	protected shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) return false
		if (changedProps.has('config')) return true

		const oldHass = changedProps.get('hass') as HomeAssistant | undefined
		if (!oldHass) return true

		if (oldHass.states[this.config.station] !== getEntityState(this.hass, this.config.station)) return true

		return false
	}

	private getStateIcon(enabled: boolean): string {
		if (!enabled) return this.config.icons.idle_disabled

		if (stateActivated(this.state)) return this.config.icons.active

		return this.config.icons.idle
	}

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
