import { UserButton } from "@clerk/clerk-react"
import { Sparkle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ModeToggle } from "../components/ui/theme-toggle"
import { Mobilesidebar } from "./Mobilesidebar"
import { Searchbar } from "./searchbar"

export const Navbar = () => {
    const navigation = useNavigate();
    return <div className="fixed z-50 w-full flex justify-between px-4 py-2 h-16 items-center border-b bg-secondary ">
        <div className="felx items-center" >
            <Mobilesidebar />
            <Link to="/">
                <h1 className="hidden md:block text-xl font-bold">
                    Sidekick.Ai
                </h1>
            </Link>
        </div>
        <div className="flex justify-center">
            <Searchbar />
        </div>
        <div className="flex items-center gap-x-3">
            <Button variant="premium" size="sm" onClick={() => {
                navigation("/subscription");
            }}>Upgrade <Sparkle className="fill-white h-4 w-4" /></Button>
            <ModeToggle />
            <UserButton />
        </div>
    </div>
}