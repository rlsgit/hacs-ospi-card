import { LitElement, html, TemplateResult, CSSResultGroup, css } from 'lit'
import { customElement, state, property } from 'lit/decorators.js'

import { OSPiSystemCardConfigElement } from './index'
import type { OSPiSystemCardConfig } from './card'
import { HomeAssistant, fireEvent, getEntities } from '../ha_helpers'
import { isStation } from '../os_helpers'

@customElement(OSPiSystemCardConfigElement.type)
export class OSPiSystemCardEditor extends LitElement {
	@property({ attribute: false }) public hass?: HomeAssistant
	@state() private config?: OSPiSystemCardConfig
	@state() private helpers?: any
	@state() private options: {}[]

	private _initialized = false

	public async setConfig(config: OSPiSystemCardConfig) {
		if (!this.config || config.device !== this.config.device) {
			this.options = []
			if (config.device) {
				getEntities(this.hass, config.device, (entity, state) => {
					if (!state || !isStation(state)) return false

					this.options.push({ label: state.attributes.name, value: entity.entity_id })
					return true
				})
			}
		}

		this.config = {
			showSensor1: false,
			sensor1Name: 'Sensor 1',
			showSensor2: false,
			sensor2Name: 'Sensor 2',

			...config
		}

		this.loadCardHelpers()
	}

	protected shouldUpdate(): boolean {
		if (!this._initialized) {
			this._initialize()
		}

		return true
	}

	private _computeLabel(schema: any) {
		switch (schema.name) {
			case 'device':
				return 'Device (Required)'
			case 'name':
				return 'Name (Required)'
			case 'showName':
				return 'Show Name'
			case 'showSensor1':
				return 'Show Sensor 1'
			case 'sensor1Name':
				return 'Sensor 1 Name'
			case 'showSensor2':
				return 'Show Sensor 2'
			case 'sensor2Name':
				return 'Sensor 2 Name'
			case 'image':
				return 'Image'
			case 'imageHeight':
				return 'Image Height (default = 150)'
			case 'imagePosition':
				return 'Image Position (default = cover)'
			default:
				return ''
		}
	}

	protected render(): TemplateResult | void {
		if (!this.hass || !this.helpers) {
			return html``
		}

		// console.log('opts: ', this.options)
		const schema = [
			{ name: 'device', selector: { device: { integration: 'opensprinkler', manufacturer: 'OpenSprinkler' } } },
			{ name: 'name', selector: { text: {} } },
			{ name: 'showName', selector: { boolean: {} } },
			{ name: 'showSensor1', selector: { boolean: {} } },
			{ name: 'sensor1Name', selector: { text: {} } },
			{ name: 'showSensor2', selector: { boolean: {} } },
			{ name: 'sensor2Name', selector: { text: {} } },
			{ name: 'image', selector: { text: {} } },
			{ name: 'imageHeight', selector: { text: {} } },
			{
				name: 'imagePosition',
				selector: {
					select: {
						multiple: false,
						mode: 'dropdown',
						options: [
							{ label: 'cover', value: 'cover' },
							{ label: 'contain', value: 'contain' }
						]
					}
				}
			}
		]

		return html`
			<div class="card-config">
				<ha-form .hass=${this.hass} .data=${this.config} .schema=${schema} .computeLabel=${this._computeLabel} @value-changed=${this._valueChanged}></ha-form>
			</div>
		`
	}

	private _initialize(): void {
		if (this.hass === undefined) return
		if (this.config === undefined) return
		if (this.helpers === undefined) return

		this._initialized = true
	}

	private async loadCardHelpers(): Promise<void> {
		this.helpers = await (window as any).loadCardHelpers()
	}

	private _valueChanged(ev: CustomEvent) {
		fireEvent(this, 'config-changed', { config: ev.detail.value })
	}

	static get styles(): CSSResultGroup {
		return css`
			.option {
				padding: 4px 0px;
				cursor: pointer;
			}
			.row {
				display: flex;
				margin-bottom: -14px;
				pointer-events: none;
			}
			.title {
				padding-left: 16px;
				margin-top: -6px;
				pointer-events: none;
			}
			.secondary {
				padding-left: 40px;
				color: var(--secondary-text-color);
				pointer-events: none;
			}
			.values {
				padding-left: 16px;
				background: var(--secondary-background-color);
				display: grid;
			}
			ha-formfield {
				padding-bottom: 8px;
			}
		`
	}
}
