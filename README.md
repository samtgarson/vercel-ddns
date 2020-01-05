![now-ddns icon](./assets/icon.svg)

**now-ddns**_—Update Now DNS when your IP changes_

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsamtgarson%2Fnow-ddns%2Fbadge&style=flat)](https://actions-badge.atrox.dev/samtgarson/now-ddns/goto)

`now-ddns` _(Now Dynamic DNS)_ is an attempt to write a small package which can be run periodically to update a now.sh DNS entry when a machine's public IP changes.

The primary use case is to update a url to point to a home server (e.g. a raspberry pi).

## Usage

Usage: `now-ddns <command> [options]`

Update Now DNS when your IP changes

Options:
  - `-V, --version`    output the version number
  - `-h, --help`       output usage information

Commands:
  - `check [options]`  Error if Now DNS does not match your IP address
  - `run [options]`    Update Now DNS with your IP address if it has changed

### Check

Error if Now DNS does not match your IP address

Options:
  - `-t, --token <token>`    Your Now API token
  - `-d, --domain <domain>`  The domain to check
  - `-n, --name <name>`      The name of the record (or blank for root record) (default: "")
  - `-h, --help`             output usage information

### Run

Update Now DNS with your IP address if it has changed

Options:
  - `-t, --token <token>`    Your Now API token
  - `-d, --domain <domain>`  The domain to check
  - `-n, --name <name>`      The name of the record (or blank for root record) (default: "")
  - `-h, --help`             output usage information

## Contribute

Bug reports and pull requests are welcome on GitHub at https://github.com/samtgarson/now-ddns. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

### Develop

```sh
npm i                    # Install dependencies
npm run test             # Run tests
npm run dev -- --options # Run commands locally
```

### License

The module is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
