# node-ntag424-sun

Create SUN messages for NTAG 424 DNA using [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) URI templates.

## Usage
```sh
npm install git+https://github.com/nikeee/node-ntag424-sun.git
```

### Basic Template
```js
import * as sun from "ntag424-sun";

const { buffer, offsets } = sun.createNdefMessage(
    "https://example.com/x?uid={uid}&counter={counter}&cmac={cmac}",
);
```
### Extra Varialbes
Instead of using `new URL().searchParams`, you can use:
```js
import * as sun from "ntag424-sun";

const { buffer, offsets } = sun.createNdefMessage(
    "https://example.com/x?foo={foo}&uid={uid}&counter={counter}&cmac={cmac}",
    { foo: "bar" },
);
```

### Available Placeholders
- `{picc}`
- `{uid}`
- `{counter}`
- `{cmac}`

Note that if picc is present, uid and counter must be absent. This library does **not** check for this.

## Usage with `node-ntag424`
```js
import { isoSelectFileMode, type TagSession, type fileSettings } from "ntag424";
import * as sun from "ntag424-sun";

// [TagSession creation]

await session.authenticate(0, key);

const ndefFileSettings = await session.getFileSettings(0x02);

const { buffer, offsets } = sun.createNdefMessage(
    "https://xd.com/x?picc={picc}&cmac={cmac}",
);

await session.writeData(
    ndefFileSettings.commMode,
    0x02,
    buffer,
    0,
);

const newSettings = {
    access: {
        read: 0x2,
        write: 0x2,
        readWrite: 0x2,
        change: 0x0,
    },
    commMode: "plain",
    sdmOptions: {
        accessRights: {
            metaRead: 0x2, // Set to a key to get encrypted PICC data
            fileRead: 0x2, // Used to create the MAC and Encrypted File data
            counterRetrieval: 0xf,
        },
        encodingMode: "ascii",
        encryptedFileData: null,
        readCounterLimit: null,

        piccDataOffset: offsets.picc,
        uidOffset: 0,
        readCounterOffset: 0,
        macInputOffset: offsets.cmac,
        macOffset: offsets.cmac,
    },
} satisfies fileSettings.FileSettings;

const tagParams = {
    fileSize: ndefFileSettings.fileSize,
    piccDataLength: 0,
    encodedReadCounterLength: 3 * 2,
    encodedUidLength: uid.length * 2,
};

await session.setFileSettings(0x02, newSettings, tagParams);
```
