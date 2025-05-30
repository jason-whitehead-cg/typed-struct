import { inspect } from 'node:util';
import { Buffer } from 'node:buffer'; // Re-add Buffer import
import { initializeAPI } from './struct';

export * from './struct';

void Promise.allSettled([import('debug'), import('iconv-lite')]).then(([debug, iconv]) => {
  initializeAPI({
    getString: (buf, encoding) => { // buf is Uint8Array
      const iconvDecode = iconv.status === 'fulfilled' && iconv.value.decode;
      let end = -1;
      for (let i = 0; i < buf.length; ++i) {
        if (buf[i] === 0) {
          end = i;
          break;
        }
      }
      if (end < 0) end = buf.length;
      const subArray = buf.subarray(0, end);
      return iconvDecode
        ? iconvDecode(Buffer.from(subArray), encoding) // Convert Uint8Array to Buffer for iconv-lite
        : new TextDecoder(encoding).decode(subArray);
    },
    setString: (buf, encoding, value) => { // buf is Uint8Array
      const iconvEncode = iconv.status === 'fulfilled' && iconv.value.encode;
      const encoded: Uint8Array | Buffer = iconvEncode // Buffer from iconv-lite is a Uint8Array
        ? iconvEncode(value, encoding)
        : new TextEncoder().encode(value); // TextEncoder only supports utf-8
      if (encoded.length > buf.length) throw new TypeError(`String is too long`);
      buf.set(encoded);
      buf.fill(0, encoded.length);
    },
    inspect,
    colorPrint: (c, msg) => {
      if (debug.status === 'rejected') return msg;
      const colors = debug.value.colors.map(color =>
        typeof color === 'string' ? parseInt(color.slice(1), 16) : color
      );
      const selectColor = (name: string): number =>
        colors[
          Math.abs([...name].reduce((hash, ch) => ((hash << 5) - hash + ch.charCodeAt(0)) | 0, 0)) %
            (colors.length || 1)
        ];
      const code = typeof c === 'number' ? c : selectColor(msg);
      const colorCode = `\u001B[3${code < 8 ? code : `8;5;${c}`}`;
      return `${colorCode};1m${msg}\u001B[0m`;
    },
  });
});
