import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ChatRequestOptions } from "ai"

interface ChatFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean,
    input: string
}


export const ChatForm = ({ handleSubmit, handleInputChange, isLoading, input }: ChatFormProps) => {
    return (
        <form onSubmit={handleSubmit} className="border-t border-primary/10 py-4 flex items-center gap-x-4" >
            <Input disabled={isLoading} value={input} onChange={handleInputChange} placeholder="Type your message..." className="bg-primary/10 h-10 rounded-lg ml-2"></Input>
            <Button disabled={isLoading} className="mr-2" >
                Send
            </Button>
        </form>
    )
}