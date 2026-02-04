import { toast } from "sonner";
import { BeatLoader } from "react-spinners"
import { useTheme } from "next-themes";
import { Uservatar } from "./Uservatar";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
export interface ChatMessageprops {
    role: "user" | "system",
    content?: string,
    isLoading?: boolean,
    src?: string
}

export const ChatMessage = ({ role, content, isLoading, src }: ChatMessageprops) => {
    const { theme } = useTheme();
    const onCopy = () => {
        if (!content) {
            return;
        }
        navigator.clipboard.writeText(content);
        toast("Content Copied to ClipBoard")
    }
    return <div className={`group flex items-start m-3 gap-x-4 ${role === "user" && "justify-end"}`}>
        {role === "system" && src && <img src={src} alt="avatar" className="h-8 w-8 rounded-full" />}
        <div className="rounded-md px-4 py-2 max-w-sm text-md bg-primary/10 whitespace-pre-wrap">
            {isLoading && !content ? <BeatLoader color={theme === "light" ? "black" : "white"} /> : content}
        </div>
        {role === "user" && <Uservatar />}
        {role === "system" && !isLoading && (
            <Button onClick={onCopy} className="opacity-0 group-hover:opacity-100 transition" size="icon" variant="ghost">
                <Copy className="w-4 h-4" />
            </Button>
        )}



    </div>
} 