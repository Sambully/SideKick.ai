import { ChatHeader } from "@/component/ChaHeader";

interface Companion {
    id: string,
    userId: string,
    username: string,
    src: string,
    name: string,
    description: string,
    instructions: string,
    seed: string,
    categoryId: string,
    messages: Message[];
    _count: {
        messages: number;
    };
}
interface Message {
    id: string,
    role: "User" | "system",
    content: string,
    createdAt: string
    userId: string,
    companionId: string
}


export const Chatclient = ({ companion }: { companion: Companion | null }) => {
    return (
        <div className="h-full w-full">
            <ChatHeader companion={companion} />
        </div>
    )
}