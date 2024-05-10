import { IconConfig } from './types'

//@ts-ignore
export const DEV_MODE: boolean = '__DEV_MODE__' === 'true'
export const getDevString = (str: string) => (DEV_MODE ? str + '-dev' : '')

export const defaults = {
	version: '0.3.0',

	imageHeightDefault: 150,

	runtimeDefault: 60
}

export const defaultIcons: IconConfig = {
	active: 'mdi:water',
	active_disabled: 'mdi:water-off',
	idle: 'mdi:water-outline',
	idle_disabled: 'mdi:water-off-outline'
}
