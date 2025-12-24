import { CldUploadButton } from "@/components/ui/cld-upload-button";
import { useEffect, useState } from "react";

interface ImageUploadProps {
    value: string,
    onChange: (src: string) => void,
    disabled?: boolean | undefined
}

export const ImageUpload = ({
    value,
    onChange,
    disabled
}: ImageUploadProps) => {
    const [hydrated, sethydrated] = useState(false);
    useEffect(() => {
        sethydrated(true);
    }, [])
    if (!hydrated) return null;
    return (
        <div className="space-y-4 w-full flex flex-col justify-center items-center">
            <CldUploadButton
                options={{
                    maxFiles: 1
                }}
                uploadPreset="AI-companion"
                onUpload={(result) => onChange(result.info.secure_url)}
            >
                <div className="border-4 p-4 border-dashed border-primary/50 rounded-lg hover:opacity-75 transition flex flex-col space-y-2 items-center justify-center">
                    <div className="relative h-40 w-40">
                        <img
                            src={value || "../public/imageupload.svg"}
                            alt="Upload"
                            className="rounded-lg object-cover opacity-75 cursor-pointer w-full h-full"
                        />
                    </div>

                </div>

            </CldUploadButton>
        </div>
    )
}