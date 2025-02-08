# node-ntag424-sun

Create SUN messages for NTAG 424 DNA using [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) URI templates.

## Usage
```sh
npm install git+https://github.com/nikeee/node-ntag424-sun.git
```

### Basic Template
```js
const { buffer, offsets } = sun.createNdefMessage(
    "https://xd.com/x?uid={uid}&counter={counter}&cmac={cmac}",
);
```

### Available Placeholders
- `{picc}`
- `{uid}`
- `{counter}`
- `{cmac}`

Note that if picc is present, uid and counter must be absent. This library does **not** check for this.
