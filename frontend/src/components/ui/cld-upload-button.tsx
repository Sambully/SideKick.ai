import { useEffect, useRef } from "react";

interface CldUploadButtonProps {
    uploadPreset: string;
    // Matches Next.js 'options' prop
    options?: {
        maxFiles?: number;
        sources?: string[];
        [key: string]: any;
    };
    // The specific prop you requested
    onUpload?: (result: any) => void;
    children?: React.ReactNode;
    className?: string;
}

export const CldUploadButton = ({
    uploadPreset,
    options,
    onUpload,
    children,
    className,
}: CldUploadButtonProps) => {
    const widgetRef = useRef<any>();

    useEffect(() => {
        // Check if script is loaded to avoid crashes
        if ((window as any).cloudinary) {
            widgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                    uploadPreset: uploadPreset,
                    ...options, // Spreads options like maxFiles, sources, etc.
                },
                (error: any, result: any) => {
                    // If upload is successful and onUpload prop exists, run it
                    if (result.event === "success" && onUpload) {
                        onUpload(result);
                    }
                    if (error) {
                        console.error("Cloudinary Error:", error);
                    }
                }
            );
        }
    }, [uploadPreset, options, onUpload]);

    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Important to stop form from submitting prematurely
        widgetRef.current?.open();
    };

    return (
        <button onClick={handleOnClick} className={className}>
            {children}
        </button>
    );
};