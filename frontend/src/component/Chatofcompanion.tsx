import { Chatclient } from "@/pages/Chatclient";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface chatparams {
    chatId: string | null
}

interface Message {
    id: string,
    role: "User" | "system",
    content: string,
    createdAt: string
    userId: string,
    companionId: string
}

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



const Chatofcompanion = ({ chatId }: chatparams) => {
    const navigation = useNavigate();
    const { isSignedIn, userId, isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const [companion, setcompanion] = useState<Companion | null>(null);
    const [loadingchat, setloadingchat] = useState(false);
    useEffect(() => {
        if (isLoaded && !userId) {
            const timer = setTimeout(() => {
                navigation("/sign-in");
            }, 3000)
            return () => clearTimeout(timer);
        }
    }, [isLoaded, userId, navigation]);
    useEffect(() => {
        const fetch = async () => {
            if (!chatId || !userId) return;
            try {
                setloadingchat(true);
                const token = await getToken();
                const response = await axios.get(`http://localhost:3000/chat/${chatId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                if (!response) {
                    throw new Error("Failed to fetch");
                }
                const data = await response.data;
                setcompanion(data);
            } catch (err) {
                console.error("we found error in chat option : ", err);

            } finally {
                setloadingchat(false);
            }
        }
        fetch();
    }, [chatId, userId, getToken])
    if (!isLoaded || loadingchat) {
        return (

            <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">Loading...</h1>
                </div>
            </div>
        )
    }
    if (!userId) {
        return (
            <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">You are not signed in</h1>
                    <p>Redirecting to sign in page...</p>
                </div>
            </div>
        )
    }
    return (
        <div className="w-full h-full max-w-4xl mx-auto min-w-md">
            <Chatclient companion={companion} />
        </div>
    )

}

export default Chatofcompanion;