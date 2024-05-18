import { html, LitElement, TemplateResult, css, PropertyValues, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { mdiDotsVertical } from '@mdi/js'
import moment from 'moment'

import { HassEntity } from 'home-assistant-js-websocket'

import { OSPiSystemCardConfigElement, OSPiSystemCardElement } from './index'
import { defaults } from '../constants'
import { EntityAndStateType, getCardStyle, getEntities, HomeAssistant } from '../ha_helpers'
import { getSystemStatusEntities, isEnabled, stateActivated, stateStoppable } from '../os_helpers'

import OSPiSystemCardDelayDialog from './delaydialog'

export interface OSPiSystemCardConfig {
	name: string
	showName: boolean
	showSensor1?: boolean
	sensor1Name?: string
	showSensor2?: boolean
	sensor2Name?: string
	image?: string
	imageHeight?: number
	imagePosition?: 'cover' | 'contain'
	device?: string
}

@customElement(OSPiSystemCardElement.type)
export default class OSPiSystemCard extends LitElement {
	@property({ attribute: false }) public hass?: HomeAssistant
	@state() private config!: OSPiSystemCardConfig

	private state?: Record<string, EntityAndStateType>

	private delayDialog?: OSPiSystemCardDelayDialog

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

		return html`
			<div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
				<div style="font-weight: bold; font-size: 18px;">${this.config.name}</div>
			</div>
		`
	}

	private getStateStatus(entity: string) {
		if (!(entity in this.state)) return nothing

		const state = this.state[entity]
		let value = state.state.state
		if (!value || value === 'unknown') return nothing

		let name = state.state.attributes.friendly_name
		name = name.replace('OpenSprinkler ', '').replace(' Active', '')
		if (entity.includes('opensprinkler_sensor_1')) name = this.config.sensor1Name || name
		if (entity.includes('opensprinkler_sensor_2')) name = this.config.sensor2Name || name

		if (state.state.attributes.unit_of_measurement) {
			value += state.state.attributes.unit_of_measurement
		}

		let ret = html``
		let valueHtml = html`<div class="system-status-item-value">${value}</div>`
		switch (entity) {
			case 'binary_sensor.opensprinkler_rain_delay_active':
				if (state.state.state === 'on') {
					const endTimeEntity = this.state['sensor.opensprinkler_rain_delay_stop_time']
					if (!endTimeEntity) {
						value = 'off'
					} else {
						const duration = moment.duration(moment(endTimeEntity.state.state).diff(moment()))
						value = 'Ends ' + duration.humanize(true)
					}
				}

				valueHtml = html`<div class="system-status-item-value">${value}</div>`
				return html`<mwc-button @click=${() => this.delayClick('rain')}
					><div class="system-status-item">
						<div class="system-status-item-name">${name}:</div>
						${valueHtml}
					</div></mwc-button
				>`
				break

			case 'binary_sensor.opensprinkler_paused':
				if (state.state.state === 'on') {
					const endTimeEntity = this.state['sensor.opensprinkler_pause_end_time']
					if (endTimeEntity && endTimeEntity.state.state !== 'unknown') {
						const duration = moment.duration(moment(endTimeEntity.state.state).diff(moment()))
						value = 'Ends ' + duration.humanize(true)
					} else {
						value = 'off'
					}
				}

				// valueHtml = html`<mwc-button @click=${() => this.delayClick('pause')}><div class="system-status-item-value">${value}</div></mwc-button>`
				valueHtml = html`<div class="system-status-item-value">${value}</div>`
				return html`<mwc-button @click=${() => this.delayClick('pause')}
					><div class="system-status-item">
						<div class="system-status-item-name">${name}:</div>
						${valueHtml}
					</div></mwc-button
				>`
				break

			default:
				break
		}

		ret = html`<div class="system-status-item">
			<div class="system-status-item-name">${name}:</div>
			${valueHtml}
		</div>`

		return ret
	}

	private cardStatus(): TemplateResult {
		return html`
			<div class="system-status">
				${this.getStateStatus('binary_sensor.opensprinkler_sensor_1_active')} ${this.getStateStatus('binary_sensor.opensprinkler_sensor_2_active')}
				${this.getStateStatus('sensor.opensprinkler_current_draw')} ${this.getStateStatus('sensor.opensprinkler_water_level')} ${this.getStateStatus('sensor.opensprinkler_flow_rate')}
				${this.getStateStatus('binary_sensor.opensprinkler_paused')} ${this.getStateStatus('binary_sensor.opensprinkler_rain_delay_active')}
			</div>
		`
	}

	private history(): TemplateResult {
		let ret = html``

		return ret
	}

	render() {
		if (!this.config) return nothing

		const sysState = getSystemStatusEntities(this.hass, this.config.device)
		// console.log(sysState)

		this.state = {}
		for (const entity in sysState) {
			if (entity.includes('opensprinkler_sensor_1') && !this.config.showSensor1) continue
			if (entity.includes('opensprinkler_sensor_2') && !this.config.showSensor2) continue

			this.state[entity] = sysState[entity]
		}

		return html` <ha-card style="${getCardStyle()}"> ${this.cardImage()} ${this.cardName()} ${this.cardStatus()} ${this.history()} </ha-card> `
	}

	public connectedCallback(): void {
		super.connectedCallback()

		this.delayDialog = new OSPiSystemCardDelayDialog()
		document.body.appendChild(this.delayDialog)
	}

	public disconnectedCallback(): void {
		super.disconnectedCallback()

		document.body.removeChild(this.delayDialog)
	}

	private menuClick() {
		// fireEvent(this, 'hass-more-info', { entityId: this.config.station })
	}

	private delayClick(which: 'rain' | 'pause') {
		const entity = which === 'rain' ? this.hass.entities['sensor.opensprinkler_rain_delay_stop_time'].entity_id : this.hass.entities['sensor.opensprinkler_pause_end_time'].entity_id

		this.delayDialog.show({
			title: which === 'rain' ? 'Rain Delay' : 'Pause Stations',
			delayUnit: which === 'rain' ? 'hours' : 'seconds',
			delayAction: (delay) => {
				const action = which === 'rain' ? 'set_rain_delay' : 'pause_stations'
				const data = which === 'rain' ? { rain_delay: delay } : { pause_duration: delay }

				//@ts-ignore TODO
				this.hass.callService('opensprinkler', action, { entity_id: entity, ...data })
			}
		})
	}

	protected shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) return false
		if (changedProps.has('config')) return true

		const oldHass = changedProps.get('hass') as HomeAssistant | undefined
		if (!oldHass) return true

		for (const entity in this.state) {
			if (oldHass.states[entity] !== this.hass.states[entity]) return true
		}

		return false
	}

	// private getStateIcon(enabled: boolean): string {
	// 	if (!enabled) return this.config.icons.idle_disabled

	// 	if (stateActivated(this.state)) return this.config.icons.active

	// 	return this.config.icons.idle
	// }

	static styles = [
		css`
			.system-status {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				padding: 5px;
			}

			.system-status-item {
				text-align: center;
				padding: 5px;
				white-space: nowrap;
			}

			.system-status-item-name {
				font-weight: bold;
			}

			.system-status-item-value {
				font-style: italic;
			}
		`
	]
}
