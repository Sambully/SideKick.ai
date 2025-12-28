import { useEffect, useRef, useState } from "react";

interface CldUploadButtonProps {
    uploadPreset: string;
    options?: {
        maxFiles?: number;
        sources?: string[];
        [key: string]: any;
    };
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
    const widgetRef = useRef<any>(null);
    // We use this state to ensure we don't try to open a widget that isn't ready
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Helper to initialize the widget
        const initWidget = () => {
            if ((window as any).cloudinary) {
                // Double check if we already have a widget to avoid duplicates
                if (widgetRef.current) return;

                widgetRef.current = (window as any).cloudinary.createUploadWidget(
                    {
                        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, // Make sure this is in your .env
                        uploadPreset: uploadPreset,
                        ...options,
                    },
                    (error: any, result: any) => {
                        if (result.event === "success" && onUpload) {
                            onUpload(result);
                        }
                        if (error) {
                            console.error("Cloudinary Error:", error);
                        }
                    }
                );
                setIsReady(true);
            }
        };

        // 1. Try to init immediately
        initWidget();

        // 2. If the script hasn't loaded yet, check every 100ms
        const intervalId = setInterval(() => {
            if (!widgetRef.current) {
                initWidget();
            } else {
                clearInterval(intervalId);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, [uploadPreset, options, onUpload]);

    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (widgetRef.current) {
            widgetRef.current.open();
        } else {
            console.warn("Cloudinary widget is not ready yet. Please wait a moment.");
        }
    };

    return (
        <button
            onClick={handleOnClick}
            className={className}
            disabled={!isReady} // Disable button until widget is ready
        >
            {children}
        </button>
    );
};