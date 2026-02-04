import { ChatMessage } from "./ChatMessage";
import type { Companion, Message } from "./types/types";


import { useEffect, useRef } from "react";

interface ChatMessagesProps {
    companion: Companion | null,
    messages: Message[],
    isLoading: boolean,
    completion: string
}
export const ChatMessages = ({ companion, messages = [], isLoading, completion }: ChatMessagesProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, completion]);

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            {messages.length != 0 ? messages.map((message, index) => (
                <ChatMessage
                    key={message.id || index}
                    role={message.role}
                    content={message.content}
                    src={companion?.src}
                />
            )) : <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">Start Conversation</h1>
                </div>
            </div>}
            {isLoading && (
                <ChatMessage
                    role="system"
                    src={companion?.src}
                    content={completion}
                    isLoading={true}
                />
            )}
            <div ref={scrollRef} />
        </div>
    )
}