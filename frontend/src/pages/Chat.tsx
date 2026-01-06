import Chatofcompanion from "@/component/Chatofcompanion";
import { useSearchParams } from "react-router-dom";
const Chat = () => {
    const [search] = useSearchParams();
    const chatId = search.get('chatId') || null;
    return (
        <div className="w-full h-full max-w-4xl mx-auto min-w-md">
            <Chatofcompanion chatId={chatId} />
        </div>
    )
}
export default Chat;