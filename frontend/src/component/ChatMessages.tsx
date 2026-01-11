import { ChatMessage } from "./ChatMessage";
import type { Companion, Message } from "./types/types";


interface ChatMessagesProps {
    companion: Companion | null,
    messages: Message[],
    isLoading: boolean
}
export const ChatMessages = ({ companion, messages = [], isLoading }: ChatMessagesProps) => {
    return (
        <div className="flex-1 overflow-y-auto pr-4">
            {messages.length != 0 ? messages.map((message) => (
                <ChatMessage
                    key={message.content}
                    role={message.role}
                    content={message.content}
                    src={companion?.src}

                />
            )) : <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">Start Conversation</h1>
                </div>
            </div>}
        </div>
    )
}