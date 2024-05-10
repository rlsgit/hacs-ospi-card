import { Auth, Connection, HassConfig, HassEntities, HassEntity, HassServices, HassServiceTarget, MessageBase } from 'home-assistant-js-websocket'
import { LitElement } from 'lit'
import { DEV_MODE } from './constants'

export type { HassEntity, LitElement }

export interface AreaRegistryEntry {
	area_id: string
	floor_id: string | null
	name: string
	picture: string | null
	icon: string | null
	labels: string[]
	aliases: string[]
}

export interface DeviceRegistryEntry {
	id: string
	config_entries: string[]
	connections: Array<[string, string]>
	identifiers: Array<[string, string]>
	manufacturer: string | null
	model: string | null
	name: string | null
	labels: string[]
	sw_version: string | null
	hw_version: string | null
	serial_number: string | null
	via_device_id: string | null
	area_id: string | null
	name_by_user: string | null
	entry_type: 'service' | null
	disabled_by: 'user' | 'integration' | 'config_entry' | null
	configuration_url: string | null
}

type EntityCategory = 'config' | 'diagnostic'

export interface EntityRegistryDisplayEntry {
	entity_id: string
	name?: string
	icon?: string
	device_id?: string
	area_id?: string
	labels: string[]
	hidden?: boolean
	entity_category?: EntityCategory
	translation_key?: string
	platform?: string
	display_precision?: number
}

export interface Context {
	id: string
	parent_id?: string
	user_id?: string | null
}

export interface ServiceCallResponse {
	context: Context
	response?: any
}

export interface ServiceCallRequest {
	domain: string
	service: string
	serviceData?: Record<string, any>
	target?: HassServiceTarget
}

export interface Resources {
	[language: string]: Record<string, string>
}

export interface HomeAssistant {
	auth: Auth
	connection: Connection
	connected: boolean
	states: HassEntities
	entities: { [id: string]: EntityRegistryDisplayEntry }
	devices: { [id: string]: DeviceRegistryEntry }
	areas: { [id: string]: AreaRegistryEntry }
	services: HassServices
	config: HassConfig
	themes: {} // TODO
	selectedTheme: {} | null // TODO
	panels: {} // TODO
	panelUrl: string
	// i18n
	// current effective language in that order:
	//   - backend saved user selected language
	//   - language in local app storage
	//   - browser language
	//   - english (en)
	language: string
	// local stored language, keep that name for backward compatibility
	selectedLanguage: string | null
	locale: {} // TODO
	resources: Resources
	localize: {} // TODO
	translationMetadata: {} // TODO
	suspendWhenHidden: boolean
	enableShortcuts: boolean
	vibrate: boolean
	debugConnection: boolean
	dockedSidebar: 'docked' | 'always_hidden' | 'auto'
	defaultPanel: string
	moreInfoEntityId: string | null
	user?: {} // TODO
	userData?: {} | null // TODO
	hassUrl(path?): string
	callService(
		domain: ServiceCallRequest['domain'],
		service: ServiceCallRequest['service'],
		serviceData?: ServiceCallRequest['serviceData'],
		target?: ServiceCallRequest['target'],
		notifyOnError?: boolean,
		returnResponse?: boolean
	): Promise<ServiceCallResponse>
	callApi<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, parameters?: Record<string, any>, headers?: Record<string, string>): Promise<T>
	fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>
	sendWS(msg: MessageBase): void
	callWS<T>(msg: MessageBase): Promise<T>

	// loadBackendTranslation(
	// 	category: Parameters<typeof getHassTranslations>[2],
	// 	integrations?: Parameters<typeof getHassTranslations>[3],
	// 	configFlow?: Parameters<typeof getHassTranslations>[4]
	// ): Promise<LocalizeFunc>
	// loadFragmentTranslation(fragment: string): Promise<LocalizeFunc | undefined>

	formatEntityState(stateObj: HassEntity, state?: string): string
	formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: any): string
	formatEntityAttributeName(stateObj: HassEntity, attribute: string): string
}

type matcherFunc = (entity: EntityRegistryDisplayEntry, state: HassEntity) => boolean

export function getEntities(hass: HomeAssistant, device?: string, matcher?: matcherFunc): { entity: EntityRegistryDisplayEntry; state: HassEntity }[] {
	let ret: { entity: EntityRegistryDisplayEntry; state: HassEntity }[] = []
	for (const e in hass.entities) {
		if (device && hass.entities[e].device_id !== device) continue
		if (matcher && !matcher(hass.entities[e], hass.states[e])) continue

		ret.push({ entity: hass.entities[e], state: hass.states[e] })
	}

	return ret
}

export function getEntityState(hass: HomeAssistant, entity: string): HassEntity | null {
	if (!hass.states[entity]) return null

	return hass.states[entity]
}

export function fireEvent(el: LitElement, event: string, detail: {}, bubbles: boolean = true, composed: boolean = true) {
	const messageEvent = new CustomEvent(event, {
		detail: detail,
		bubbles: bubbles,
		composed: composed
	})
	el.dispatchEvent(messageEvent)
}

export function getCardStyle(style?: string): string {
	const devStyle = DEV_MODE ? ' border: 1px dashed red; ' : ''

	return (style || '') + devStyle
}
