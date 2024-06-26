import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { mdiClose } from '@mdi/js'
import { getDevString } from '../constants'

export const defaultRuntime = 10

export type OSPiStationCardRuntimeDialogOptionsType = {
	runtime?: number
	runAction: (runtime: number) => void
}

@customElement(getDevString('ospi-stationcard-runtime-dialog'))
export default class OSPiStationCardRuntimeDialog extends LitElement {
	@state() private open = false
	@state() private runtime: number
	@state() private error: string

	private config: OSPiStationCardRuntimeDialogOptionsType

	public show(config: OSPiStationCardRuntimeDialogOptionsType) {
		this.config = {
			runtime: defaultRuntime,
			...config
		}
		this.runtime = this.config.runtime

		this.open = true
	}

	public close() {
		this.open = false
	}

	private run() {
		if (this.runtime >= 1 && this.runtime <= 30) {
			this.close()
			this.error = undefined
			this.config.runAction(this.runtime)
		} else {
			this.error = 'Runtime must be between 1 and 30 minutes'
		}
	}

	private runtimeChanged(event) {
		this.runtime = event.target.value
	}
	protected render() {
		if (!this.open) return html``

		const heading = html` <div class="header_title">
			<span>Runtime</span>
			<ha-icon-button .label=${'Close'} .path=${mdiClose} dialogAction="close" class="header_button"></ha-icon-button>
		</div>`

		const label = 'Enter runtime in minutes'

		return html`
			<ha-dialog open @closed=${this.close} .heading=${heading}>
				<div class="content" style="display: flex; flex-direction: row; flex-wrap: wrap;">
					${this.error ? html`<ha-alert style="overflow-wrap: break-word; margin-bottom: 5px;" alert-type="error">${this.error}</ha-alert>` : ''}

					<ha-textfield type="number" name="runtime" .label=${label} .value=${this.runtime} @input=${this.runtimeChanged} required dialogInitialFocus></ha-textfield>
				</div>
				<mwc-button slot="primaryAction" @click=${this.run}>Run</mwc-button>
			</ha-dialog>
		`
	}
}
