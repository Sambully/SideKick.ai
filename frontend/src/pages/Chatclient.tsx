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
    const { input, handleInputChange, handleSubmit, isLoading, setInput, complete, completion } = useCompletion({
        api: `http://localhost:3000/api/chat/${companion?.id}`,
        headers: async () => {
            const token = await getToken();
            return {
                Authorization: `Bearer ${token}`
            }
        },
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
        }
    });


    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = await getToken();
        console.log("Debug: Token retrieved:", token ? "Yes (length " + token.length + ")" : "No");

        if (!token) {
            console.error("No token found - user might be logged out");
            return;
        }

        const userMessage: Message = {
            role: "user",
            content: input,
            createdAt: new Date().toISOString(),
            id: Date.now().toString(),
            userId: "",
            companionId: companion?.id || ""
        }
        setmessages((prev) => [...prev, userMessage]);

        // 3. Send Request
        // handleSubmit(e); // Doesn't support dynamic headers easily in this version
        complete(input, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // 4. DELETE THIS LINE: setInput(""); 
        // (Let onFinish handle clearing, otherwise you send an empty body!)
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