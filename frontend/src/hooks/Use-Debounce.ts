import { useEffect, useState } from "react"

export function useDevounce<T>(value : T , delay? : number){
    const [debounce, setdebounced] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setdebounced(value);
        } , delay || 500);
        return () => {
            clearTimeout(timer);
        }
    }, [value, delay]);
    return debounce; 
}