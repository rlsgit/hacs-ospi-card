# OpenSprinkler Cards for Home Assistant

![GitHub Release](https://img.shields.io/github/v/release/rlsgit/hacs-ospi-card)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

A set of custom cards for [Home Assistant][home-assistant] to control an [OpenSprinkler][opensprinkler] irrigation system.

NOTE: While the package is named OSPi, it should work with any OpenSprinkler variant.

Requires:

- HomeAssistant (tested with 2024.5)
- [OpenSprinkler integration][opensprinkler-integration]

**_Special thanks to [rianadon] for his [OpenSprinkler-Card] and for inspiration and code._**

## Install

OpenSprinkler Card is available from [HACS][hacs] (search for "ospi cards"). If you don't have [HACS][hacs] installed, follow the [manual installation](#manual) instructions.

## Cards

There are multiple cards included in the package:

- ![Static Badge](https://img.shields.io/badge/Coming%20Soon-yellow) **OSPi SystemCard** - a card for status and control of the controller
- **OSPi StationCard** - a card for status and control of an individual station

## Options

### OSPiStationCard

(A visual editor is included)

| Name          | Type    | Requirement  | Description                                             |
| ------------- | ------- | ------------ | ------------------------------------------------------- |
| type          | string  | **Required** | `custom:ospi-sstationcard`                              |
| device        | string  | **Required** | Device id of the OpenSprinkler in Home Assistant        |
| station       | string  | **Required** | Entity id of the OpenSprinkler station                  |
| name          | string  | **Optional** | Station display name                                    |
| showName      | boolean | **Optional** | Toggle display of station name (default=true)           |
| image         | string  | **Optional** | Local path or URL to a station image                    |
| imageHeight   | number  | **Optional** | Image height in px for station image (default=150)      |
| imagePosition | string  | **Optional** | Image position, either contain or cover (default=cover) |

Finding device ids is tricky, so I recommend using the dropdown in the visual card editor to set `device` rather than YAML.

## Entity ID requirements

This card locates your OpenSprinkler entities by using their entity ids. If you haven't changed these, you have nothing to worry about.

Otherwise, make sure:

- The ids of station status sensors end with `_status`
- The ids of program running binary sensors end with `_running`
- The id of the OpenSprinkler controller enabled switch ends with `_enabled`
- The ids of program & station enabled switches end with `_enabled`
- The id of the rain delay active binary sensor ends with `_rain_delay_active`
- The id of the rain delay stop time sensor ends with `_rain_delay_stop_time`

[## Manual installation](#manual)

1. Download `ospi-cards.js` from the [latest release][release] and move this file to the `config/www` folder.
2. Ensure you have advanced mode enabled (accessible via your username in the bottom left corner)
3. Go to Configuration -> Lovelace Dashboards -> Resources.
4. Add `/local/opensprinkler-card.js` with type JS module.
5. Refresh the page? Or restart Home Assistant? The card should eventually be there.

[home-assistant]: https://github.com/home-assistant/home-assistant
[opensprinkler]: https://opensprinkler.com
[opensprinkler-integration]: https://github.com/vinteo/hass-opensprinkler
[hacs]: https://hacs.xyz/
[release]: https://github.com/rlsgit/hacs-ospi-card/releases
[rianadon]: https://github.com/rianadon
[OpenSprinkler-Card]: https://github.com/rianadon/opensprinkler-card
