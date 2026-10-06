const HEX_DIGITS = /^[0-9a-f]+$/;
const REPLACEMENT_BYTES: readonly number[] = [0xef, 0xbf, 0xbd];

const encodeCodePoint = (char: string): readonly number[] => {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) return [code];
    if (code < 0x800) return [0xc0 | (code >> 6), 0x80 | (code & 0x3f)];
    if (code >= 0xd800 && code <= 0xdfff) return REPLACEMENT_BYTES;
    if (code < 0x10000) return [0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f)];
    return [0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f)];
};

export const utf8Bytes = (text: string): readonly number[] => Array.from(text).flatMap(encodeCodePoint);

export const compactHex = (hex: string): string => hex.replace(/\s+/g, "").toLowerCase();

export const sealText = (text: string, key: string): string => {
    const keyBytes = utf8Bytes(key);
    if (keyBytes.length === 0) return "";

    return utf8Bytes(text)
        .map((byte, index) => (byte ^ keyBytes[index % keyBytes.length]).toString(16).padStart(2, "0"))
        .join("");
};

export const openSealedBytes = (hex: string, key: string): readonly number[] | null => {
    const digits = compactHex(hex);
    const keyBytes = utf8Bytes(key);
    if (keyBytes.length === 0 || digits.length === 0 || digits.length % 2 !== 0 || !HEX_DIGITS.test(digits)) return null;

    return (digits.match(/../g) ?? []).map(
        (pair, index) => Number.parseInt(pair, 16) ^ keyBytes[index % keyBytes.length],
    );
};

export const readableText = (bytes: readonly number[]): string | null =>
    bytes.length > 0 && bytes.every((byte) => byte >= 32 && byte <= 126)
        ? bytes.map((byte) => String.fromCharCode(byte)).join("")
        : null;

export const openSealed = (hex: string, key: string): string | null => {
    const bytes = openSealedBytes(hex, key);
    return bytes === null ? null : readableText(bytes);
};
