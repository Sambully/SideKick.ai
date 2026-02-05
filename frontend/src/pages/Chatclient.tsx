import { ChatHeader } from "@/component/ChaHeader";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCompletion } from "@ai-sdk/react";
import { ChatForm } from "@/component/ChatForm";
import { ChatMessages } from "@/component/ChatMessages";
import type { ChatMessageprops } from "@/component/ChatMessage";
import type { Companion, Message } from "@/component/types/types";
import { useAuth } from "@clerk/clerk-react";



export const Chatclient = ({ companion }: { companion: Companion | null }) => {
    const navigation = useNavigate();
    const [messages, setmessages] = useState<Message[]>(companion?.messages || []);
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const [completion, setCompletion] = useState("");

    const handleInputChange = (e: any) => {
        setInput(e.target.value);
    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;

        const token = await getToken();
        if (!token) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            createdAt: new Date().toISOString(),
            id: Date.now().toString(),
            userId: "",
            companionId: companion?.id || ""
        }
        setmessages((prev) => [...prev, userMessage]);

        setIsLoading(true);
        setCompletion("");
        const currentInput = input;
        setInput(""); // Clear input immediately

        try {
            const response = await fetch(`http://localhost:3000/api/chat/${companion?.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ prompt: currentInput })
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedResponse += chunk;
                setCompletion((prev) => prev + chunk);
            }

            // Stream finished
            const systemMessage: Message = {
                role: "system",
                content: accumulatedResponse,
                createdAt: new Date().toISOString(),
                id: Date.now().toString(),
                userId: "",
                companionId: companion?.id || ""
            };

            setmessages((prev) => [...prev, systemMessage]);
            setCompletion(""); // Clear streaming buffer

        } catch (error) {
            console.error("Streaming error:", error);
            // Optional: fallback toast
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <div className="px-4 flex flex-col h-full w-full">
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                messages={messages}
                isLoading={isLoading}
                completion={completion}
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