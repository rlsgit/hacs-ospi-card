import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { mdiClose } from '@mdi/js'
import { getDevString } from '../constants'

export const defaultRuntime = 60
export type OSPiSystemCardDelayDialogOptionsType = {
	title: string
	delay?: number
	delayUnit: 'seconds' | 'hours'
	delayAction: (delay: number) => void
}

@customElement(getDevString('ospi-systemcard-delay-dialog'))
export default class OSPiSystemCardDelayDialog extends LitElement {
	@state() private open = false
	@state() private delay: number // in hours
	@state() private error: string

	private config: OSPiSystemCardDelayDialogOptionsType

	public show(config: OSPiSystemCardDelayDialogOptionsType) {
		this.config = {
			...config
		}
		this.delay = this.config.delay || 0

		this.open = true
	}

	public close() {
		this.open = false
	}

	private delayAction() {
		this.close()
		this.error = undefined
		this.config.delayAction(this.delay)
	}

	private delayChanged(event) {
		this.delay = event.target.value
	}
	protected render() {
		if (!this.open) return html``

		const heading = html` <div class="header_title">
			<span>${this.config.title}</span>
			<ha-icon-button .label=${'Close'} .path=${mdiClose} dialogAction="close" class="header_button"></ha-icon-button>
		</div>`

		const label = `Enter delay in ${this.config.delayUnit}`

		return html`
			<ha-dialog open @closed=${this.close} .heading=${heading}>
				<div class="content" style="display: flex; flex-direction: row; flex-wrap: wrap;">
					${this.error ? html`<ha-alert style="overflow-wrap: break-word; margin-bottom: 5px;" alert-type="error">${this.error}</ha-alert>` : ''}

					<ha-textfield type="number" name="delay" .label=${label} .value=${this.delay} @input=${this.delayChanged} required dialogInitialFocus></ha-textfield>
				</div>
				<mwc-button slot="primaryAction" @click=${this.delayAction}>Set</mwc-button>
			</ha-dialog>
		`
	}
}
