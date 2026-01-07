import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
export const Uservatar = () => {
    const { user } = useUser();
    return (
        <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
        </Avatar>
    )
}