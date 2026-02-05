import * as z from "zod";
import type { Companion, Category } from "./types/types";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "./Image-upload";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { Wand } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
interface CompanionFormProps {
    initialData: Companion | null | undefined;
    categories: Category[] | null | undefined;
}
const PREAMBLE = `You are a fictional character who works as a career and life guidance mentor. You talk like a normal, experienced person, not a motivational speaker and not a corporate robot.
You help people understand their strengths, weaknesses, interests, and realistic career paths. You give honest advice about skills, education, jobs, and long-term growth. You believe confusion comes from lack of clarity and action, not lack of talent.
You explain things in simple language, using real-life examples. You focus on practical decisions, skill-building, and consistency. You do not promise shortcuts. You do not exaggerate outcomes.
You are currently talking to a student or young professional who is unsure about career direction and future planning. Your goal is to guide them calmly and clearly so they can make informed decisions.
`;

const SEED_CHAT = `Human: Hi, I am feeling confused about my career and future.
Guide: That is normal. Confusion usually means you have options but no clear plan. First tell me what you are currently studying or working on.
Human: I am studying but I am not sure if I chose the right field.
Guide: Most people feel that way. The question is not whether the field is perfect, but whether you are building skills that have value. What skills are you actually learning right now?
Human: I am learning some basics, but I feel lost about what comes next.
Guide: Feeling lost means you need structure, not motivation. You need to decide one direction, break it into small steps, and work on it consistently. Random effort will keep you stuck.
Human: How do I decide the right direction?
Guide: Look at three things: what you can tolerate doing daily, what skills the market pays for, and what you are willing to work hard at for the next few years. The overlap is your direction.
`;
const CompanionFormSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required"
    }),
    description: z.string().min(1, {
        message: "Description is required"
    }),
    instructions: z.string().min(200, {
        message: "Instructions are required min 200 characters"
    }),
    seed: z.string().min(200, {
        message: "Seed is required min 200 characters"
    }),
    src: z.string().min(1, {
        message: "Image is required"
    }),
    categoryId: z.string().min(1, {
        message: "Category is required"
    })
})

const CompanionForm = ({ initialData, categories }: CompanionFormProps) => {
    const navigation = useNavigate();
    const form = useForm<z.infer<typeof CompanionFormSchema>>({
        resolver: zodResolver(CompanionFormSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined

        }
    })
    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form])
    const { getToken } = useAuth();

    const isloading = form.formState.isSubmitting;
    const onsubmit = async (values: z.infer<typeof CompanionFormSchema>) => {
        try {
            const token = await getToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            if (initialData?.id) {
                await axios.patch(`http://localhost:3000/companion/${initialData.id}`, values, config);
                toast.success("Companion Updated Successfully");
            } else {
                await axios.post(`http://localhost:3000/companion/new`, values, config);
                toast.success("Companion Created Successfully");
            }
            navigation("/Dashboard");
        } catch (err) {
            console.error("Submit Error:", err);
            toast.error("Something went wrong", {
                description: "Please check your inputs and try again"
            })
        }
    }
    const onInvalid = (error: any) => {
        toast.error("Invalid form", {
            description: error
        })
    }
    return <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit, onInvalid)} className="space-y-2 pb-10">
                <div className="space-y-2 w-full ">
                    <div>
                        <h3 className="text-3xl font-medium">General Information</h3>
                        <p className="text-lg text-primary/40">General instructions about your companion</p>
                    </div>
                    <Separator className="bg-primary/10">

                    </Separator>
                </div>
                <FormField
                    name="src"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2 justify-center items-center space-y-4">
                            <FormControl>
                                <ImageUpload disabled={isloading} onChange={(value) => field.onChange(value)} value={field.value} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 pt-2 gap-4">
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1 gap-4">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isloading}
                                        placeholder="Write Companion Name..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1 gap-4">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isloading}
                                        placeholder="eg. Industry Leader , Classmate ..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="categoryId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1 gap-4">
                                <FormLabel>Category</FormLabel>
                                <Select
                                    disabled={isloading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Select a category" defaultValue={field.value} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
                <div className="space-y-2 w-full pt-15">
                    <div>
                        <h3 className="text-3xl font-medium">Detailed Information</h3>
                        <p className="text-lg text-primary/40">Help you Sidekick how to behave..</p>
                    </div>
                    <Separator className="bg-primary/10">
                    </Separator>
                </div>
                <FormField
                    name='instructions'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1 gap-4 pt-2">
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea className="bg-background row-12" disabled={isloading} placeholder={PREAMBLE} {...field} />
                            </FormControl>
                            <FormDescription>You can resize text area by dragging bottom right corner</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                <FormField
                    name='seed'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1 gap-4 pt-2">
                            <FormLabel>Seed Chat</FormLabel>
                            <FormControl>
                                <Textarea className="bg-background rows-12" disabled={isloading} placeholder={SEED_CHAT} {...field} />
                            </FormControl>
                            <FormDescription>You can resize text area by dragging bottom right corner</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                <div className="w-full flex pt-3 justify-center">
                    <Button size="lg" disabled={isloading}>
                        {initialData ? " Update your companion" : "Create your companion"}
                        <Wand></Wand>
                    </Button>

                </div>



            </form>
        </Form>
    </div>
}

export default CompanionForm;