import QrCode from 'qrcode';
import { networkInterfaces } from 'os';

class QrCodeServer {
	name = 'qrcode-server';
	#server;
	#addressSets = [];
	#settings;

	get protocols() {
		return this.#settings.protocols || ['http'];
	}

	get networks() {
		return this.#settings.networks || Object.entries(networkInterfaces())
		.map(([interface, addresses]) => {
			let address;

			if (this.addressFamilies && Array.isArray(this.addressFamilies) && this.addressFamilies.length) {
				this.addressFamilies.find((f) => address = addresses.find(({family}) => f === true || f === family));
			} else {
				address = addresses[0];
			}

			if ( ! address) {
				return {internal: true};
			}

			address.interface = interfaceName;
			return address;
		})
		.filter(v => ! v.internal);
	}

	get addressFamilies() {
		return (typeof this.#settings.addressFamilies === 'string' ? [this.#settings.addressFamilies] : this.#settings.addressFamilies) || ['IPv4', 'IPv6'];
	}

	constructor(settings) {
		this.#settings = settings || {};
	}

	configureServer(server) {
		this.#server = server;

		this.#drawQrCode(this.#server.httpServer.address());

		this.#server.httpServer.on('listening', () => {
			this.#drawQrCode(this.#server.httpServer.address());
		});
	}

	#drawQrCode(addressSet) {
		if ( ! addressSet) {
			return;
		}

		let {address, port, family} = addressSet;

		if (
			(family === 'IPv4' && address.startsWith('127.'))
			|| (family === 'IPv6' && address === '::1')
			|| this.#addressSets.some((a) => a.family === family && a.address === address && a.port === port)
		) {
			return;
		}

		if (address === '::') {
			this.networks
			.forEach(({address, family}) => {
				this.#drawQrCode({address, port, family});
			});

			return;
		}

		this.#addressSets.push(addressSet);

		this.protocols.forEach((protocol) => {
			let url = protocol + '://' + (family === 'IPv4' ? address : '[' + address + ']') + ':' + port + '/';
			QrCode.toString(url, {type: 'terminal', small: true, color: {light: '#cd3088ff', dark: '#000000ff'}, })
			.then((code) => {
				setTimeout(() => {
					this.#server.config.logger.info('  ' + url);
					this.#server.config.logger.info('  ' + code.replace(/(\n)/g, "$1  "));
				});
			});
		});
	}
}

export default (...args) => {
	let obj = new QrCodeServer(...args);

	return Object.fromEntries(
		Object.getOwnPropertyNames(QrCodeServer.prototype)
		.filter((key) => {
			return key !== 'constructor' && obj[key] instanceof Function;
		})
		.map((key) => {
			return [key, obj[key].bind(obj)];
		})
	);
};
