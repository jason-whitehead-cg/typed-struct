import { initializeAPI } from './struct';

export * from './struct';

initializeAPI({
  getString: (buf, encoding) => {
    // buf is Uint8Array
    let end = -1;
    for (let i = 0; i < buf.length; ++i) {
      if (buf[i] === 0) {
        end = i;
        break;
      }
    }
    if (end < 0) end = buf.length;
    // Use TextDecoder for Uint8Array
    return new TextDecoder(encoding).decode(buf.subarray(0, end));
  },
  setString: (buf, encoding, value) => {
    // buf is Uint8Array, encoding is mostly ignored by TextEncoder (UTF-8 is used)
    const encoded = new TextEncoder().encode(value);
    if (encoded.length > buf.length) throw new TypeError(`String is too long`);
    buf.set(encoded);
    buf.fill(0, encoded.length);
  },
  inspect: undefined,
  colorPrint: (c, msg) => msg,
});
