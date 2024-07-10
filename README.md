# Vite QR Code

This package is a vite plugin to show a QR code for any hosted vite bundle

## Installation

```
npm install @eventengineering/vite-qr-code
```

## Usage

```js
import ViteQrCode from '@eventengineering/vite-qr-code';

export default defineConfig(() => ({
	...
	plugins: [
		...
		ViteQrCode(),
	],
});
```

## Settings

A settings object can be passed into the function. This can contain:

 - `networks` (Array of object - defaults to all found networks, each object must contain address and family)
 - `protocols` (Array of string - defaults to "http")

## Caveats

In testing, the full addresses couldn't be pulled from the vite server, though I'm not sure why. As such, use of the networkInterfaces function on the OS, and filtering out the loopback interface has been used

HTTPS would be preferable to have the full stack in a browser, however it is unlikely you have it configured for a development IP. By all means, change the protocols if you need.
