/**
 * A basic polyfill for LangChainStream that works with the Web Streams API.
 * This is needed because 'ai' SDK v6+ has removed LangChainStream.
 */
export function LangChainStream(callbacks?: any) {
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const handlers = {
        handleLLMNewToken: async (token: string) => {
            console.log("Stream: New token received (length " + token.length + ")");
            await writer.write(encoder.encode(token));
        },
        handleLLMEnd: async () => {
            console.log("Stream: End of stream");
            await writer.close();
        },
        handleLLMError: async (e: any) => {
            console.error("Stream: Error inside handler:", e);
            await writer.abort(e);
        }
    };

    return { stream: stream.readable, handlers };
}
