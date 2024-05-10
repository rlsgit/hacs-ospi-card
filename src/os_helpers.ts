import { getEntities, type EntityAndStateType, type HassEntity, type HomeAssistant } from './ha_helpers'

export type EntitiesFunc = (predicate: (entity: HassEntity) => boolean) => HassEntity[]

const MANUAL_ID = 99
const RUN_ONCE_ID = 254

const WAITING_STATES = ['waiting']
const ACTIVE_STATES = ['program', 'once_program', 'manual', 'on']
const STOPPABLE_STATES = [...ACTIVE_STATES, ...WAITING_STATES]

export const isStation = (entity: HassEntity) => entity.attributes.opensprinkler_type === 'station' && entity.entity_id.startsWith('sensor.')
export const isProgram = (entity: HassEntity) => entity.attributes.opensprinkler_type === 'program' && entity.entity_id.startsWith('binary_sensor.')
export const isController = (entity: HassEntity) => entity.attributes.opensprinkler_type === 'controller' && entity.entity_id.startsWith('switch.')
export const isSystem = (entity: HassEntity) => entity.attributes.opensprinkler_type === undefined

export const isRunOnce = (entity: HassEntity) => entity.entity_id === 'run_once'
export const isState = (entity: HassEntity) => !entity.attributes?.opensprinkler_type
export const isStationProgEnable = (entity: HassEntity) => entity.entity_id.startsWith('switch.')
export const isPlayPausable = (entity: HassEntity) => isStation(entity) || isProgram(entity) || isRunOnce(entity)
export const isRainDelayActiveSensor = (entity: HassEntity) => entity.entity_id.startsWith('binary_sensor.') && entity.entity_id.endsWith('rain_delay_active')
export const isRainDelayStopTime = (entity: HassEntity) => entity.entity_id.startsWith('sensor.') && entity.entity_id.endsWith('rain_delay_stop_time')

export function hasRunOnce(entities: EntitiesFunc) {
	return entities(isStation).some((e) => e.attributes.running_program_id === RUN_ONCE_ID)
}
export function hasManual(entities: EntitiesFunc) {
	return entities(isStation).some((e) => e.attributes.running_program_id === MANUAL_ID)
}
export function hasRainDelayActive(entities: EntitiesFunc) {
	return entities(isRainDelayActiveSensor).some((e) => e.state === 'on')
}

export const stateWaiting = (entity: HassEntity) => WAITING_STATES.includes(entity.state)
export const stateStoppable = (entity: HassEntity) => STOPPABLE_STATES.includes(entity.state)
export const stateActivated = (entity: HassEntity) => ACTIVE_STATES.includes(entity.state)

export function osName(entity: HassEntity) {
	return (
		entity.attributes.name ||
		entity.attributes.friendly_name
			.replace(/ Station Status$/, '')
			.replace(/ Program Running$/, '')
			.replace(/^OpenSprinkler /, '')
	)
}

export function isEnabled(hass: HomeAssistant, entity: HassEntity) {
	if (isRunOnce(entity)) return true

	for (const [key, value] of Object.entries(hass.entities)) {
		const state = hass.states[value.entity_id]
		if (state.attributes.index === entity.attributes.index) {
			if (state.attributes.opensprinkler_type === entity.attributes.opensprinkler_type) {
				if (key.startsWith('switch.')) {
					return state.state === 'on'
				}
			}
		}
	}

	return false
}

export function getSystemStatusEntities(hass: HomeAssistant, device: string): Record<string, EntityAndStateType> {
	const entities = getEntities(hass, device, (entity, state) => isSystem(state))

	let ret = {}
	for (const entity of entities) {
		ret[entity.entity.entity_id] = entity
	}

	return ret
}
