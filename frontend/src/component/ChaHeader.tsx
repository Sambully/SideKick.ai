import { Button } from "@/components/ui/button";
import { ChevronLeft, Delete, DeleteIcon, Edit, LucideDelete, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, useAuth } from "@clerk/clerk-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";

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

export const ChatHeader = ({ companion }: { companion: Companion | null }) => {
    const navigation = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const ondelete = async () => {
        try {
            const token = await getToken();
            await axios.delete(`http://localhost:3000/companion/${companion?.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            toast.success("Companion deleted successfully");
            navigation("/dashboard");

        } catch (err) {
            console.error("Delete Error:", err)
            toast.error("Error in deleting companion", {
                description: "Please try again"
            })
        }
    }
    return (
        <div className="border-b flex justify-between w-full border-primary/25 p-4">
            <div className="gap-x-2 items-center font-bold">
                <Button size="icon" variant="ghost" onClick={() => navigation("/dashboard")}>
                    <ChevronLeft className="h-24 w-24 stroke-[4]" />
                </Button>
            </div>
            <div className="flex flex-col justify-around">
                <div className="flex items-center gap-x-2">
                    <Avatar>
                        <AvatarImage src={companion?.src} />
                        <AvatarFallback>{companion?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-lg font-bold text-muted-foreground">{companion?.name}</div>
                    <div><MessagesSquare size={15} className="text-muted-foreground" /></div>
                </div>

            </div>
            {user?.id === companion?.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <MoreVertical size={24} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigation(`/companion/${companion?.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={ondelete} className="text-red-400">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

