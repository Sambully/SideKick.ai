import { ChatHeader } from "@/component/ChaHeader";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCompletion } from "@ai-sdk/react";
import { ChatForm } from "@/component/ChatForm";
import { ChatMessages } from "@/component/ChatMessages";
import type { ChatMessageprops } from "@/component/ChatMessage";
import type { Companion, Message } from "@/component/types/types";



export const Chatclient = ({ companion }: { companion: Companion | null }) => {
    const navigation = useNavigate();
    const [messages, setmessages] = useState<Message[]>(companion?.messages || []);
    const { input, handleInputChange, handleSubmit, isLoading, setInput } = useCompletion({
        api: `/api/chat/${companion?.id}`,
        onFinish(prompt, response) {
            const systemMessage: Message = {
                role: "system",
                content: response,
                createdAt: new Date().toISOString(),
                id: Date.now().toString(),
                userId: "",
                companionId: companion?.id || ""
            };

            setmessages((prev) => [...prev, systemMessage]);
            setInput("");
            navigation(0);
        }
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: Message = {
            role: "user",
            content: input,
            createdAt: new Date().toISOString(),
            id: Date.now().toString(),
            userId: "",
            companionId: companion?.id || ""
        }
        setmessages((prev) => [...prev, userMessage]);
        setInput("");
        handleSubmit(e);
    }



    return (
        <div className="px-4 flex flex-col h-full w-full">
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                messages={messages}
                isLoading={isLoading}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={onSubmit}
            />
        </div>
    )
}