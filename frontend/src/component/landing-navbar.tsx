import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const LandingNavbar = () => {
    const { isSignedIn } = useAuth();

    return (
        <nav className="p-4 bg-transparent flex items-center justify-between">
            <Link to="/" className="flex items-center">
                <div className="relative h-8 w-8 mr-4">
                    <Sparkles className="h-8 w-8 text-indigo-500 fill-indigo-500" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                    SideKick
                </h1>
            </Link>
            <div className="flex items-center gap-x-2">
                <Link to={isSignedIn ? "/dashboard" : "/sign-in"}>
                    <Button variant="outline" className="rounded-full bg-white text-black hover:bg-gray-200 border-none font-semibold">
                        {isSignedIn ? "Dashboard" : "Get Started"}
                    </Button>
                </Link>
            </div>
        </nav>
    );
};