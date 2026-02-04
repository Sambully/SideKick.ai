import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"


interface CompanionProps {
    data: {
        id: string,
        name: string,
        src: string,
        description: string,
        username: string,
        _count: {
            messages: number
        },

    }[],
    isLoading?: boolean

}


const Companions = ({ data, isLoading }: CompanionProps) => {
    if (isLoading) {
        return (
            <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">Loading...</h1>
                </div>
            </div>
        )
    }
    if (!Array.isArray(data) || data.length == 0) {
        return (
            <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex flex-col items-center justify-center w-100 h-60">
                    <h1 className="text-2xl text-gray-500 font-semibold">No Companions Found</h1>
                </div>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-10 pt-4 px-4 md:px-6 md:pl-24">
            {Array.isArray(data) && data.map((item) => (
                <Card
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border-0 bg-secondary/10 shadow-sm transition-all hover:shadow-xl hover:bg-secondary/20"
                >
                    <Link to={`/chat/${item.id}`} className="block h-full">
                        <div className="relative w-full aspect-square overflow-hidden bg-secondary/20">
                            <img
                                src={item.src}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        <CardHeader className="p-4 space-y-1 text-left">
                            <h3 className="font-bold text-lg text-foreground truncate">
                                {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                                {item.description}
                            </p>
                        </CardHeader>

                        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs w-full">
                            <p className="font-medium text-primary/70 lowercase truncate max-w-[100px]">
                                @{item.username}
                            </p>
                            <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-full text-muted-foreground shadow-sm">
                                <MessageSquare className="w-3 h-3" />
                                <span>{item._count.messages}</span>
                            </div>
                        </CardFooter>
                    </Link>
                </Card>
            ))}
        </div>
    )
}

export default Companions