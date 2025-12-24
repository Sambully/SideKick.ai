import * as z from "zod";
import type { Companion, Category } from "./types/types";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "./Image-upload";
interface CompanionFormProps {
    initialData: Companion | null | undefined;
    categories: Category[] | null | undefined;
}

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

    const isloading = form.formState.isSubmitting;
    const onsubmit = async (values: z.infer<typeof CompanionFormSchema>) => {
        console.log(values);
    }
    return <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-2 pb-10">
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
                    render={({ field }) => (
                        <FormItem className="flex flex-col justify-center items-center space-y-4">
                            <FormControl>
                                <ImageUpload disabled={isloading} onChange={(value) => field.onChange(value)} value={field.value} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    </div>
}

export default CompanionForm;