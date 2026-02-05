import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Code, MessageSquare, Smile } from "lucide-react";

const testimonials = [
    {
        name: "Coding Assistant",
        avatar: "C",
        title: "Software Engineer",
        description: "Helps me debug code instantly. It's like having a senior dev in my pocket.",
        icon: Code,
        color: "text-green-500"
    },
    {
        name: "Life Coach",
        avatar: "L",
        title: "Productivity Guru",
        description: "Keeps me organized and motivated throughout the day. Best AI friend ever!",
        icon: Brain,
        color: "text-purple-500"
    },
    {
        name: "Casual Friend",
        avatar: "F",
        title: "Student",
        description: "I love chatting about movies and games. It feels so real and responsive.",
        icon: MessageSquare,
        color: "text-pink-500"
    },
    {
        name: "Therapist Bot",
        avatar: "T",
        title: "Wellness",
        description: "A safe space to vent and get objective, calming advice when I'm stressed.",
        icon: Smile,
        color: "text-yellow-500"
    },
];

export const LandingContent = () => {
    return (
        <div className="px-10 pb-20">
            <h2 className="text-center text-4xl text-white font-extrabold mb-10">
                Powered by Advanced AI
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {testimonials.map((item) => (
                    <Card key={item.description} className="bg-[#192339] border-none text-white hover:scale-105 transition duration-200 cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                <div className={`p-2 w-fit rounded-md bg-white/10 ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-lg">{item.name}</p>
                                    <p className="text-zinc-400 text-sm">{item.title}</p>
                                </div>
                            </CardTitle>
                            <CardContent className="pt-4 px-0">
                                {item.description}
                            </CardContent>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
};