export declare const toByteString: (data: string | Uint8Array) => Promise<string>;
/**
 * @param isByteString set to true if already byte string to prevent bloat
 *  due to reencoding
 */
export declare const stringToBase64: (str: string, isByteString?: boolean) => Promise<string>;
export declare const base64ToString: (base64: string, isByteString?: boolean) => Promise<string>;
declare type EncodedData = {
    encoded: string;
    encoding: "bstring";
    /** whether text is compressed (zlib) */
    compressed: boolean;
    /** version for potential migration purposes */
    version?: string;
};
/**
 * Encodes (and potentially compresses via zlib) text to byte string
 */
export declare const encode: ({ text, compress, }: {
    text: string;
    /** defaults to `true`. If compression fails, falls back to bstring alone. */
    compress?: boolean | undefined;
}) => Promise<EncodedData>;
export declare const decode: (data: EncodedData) => Promise<string>;
export {};
