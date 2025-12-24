import { Search } from "lucide-react";
import qs from 'query-string';
import { useEffect, useState, type ChangeEventHandler } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../components/ui/input";
import { useDevounce } from "../hooks/Use-Debounce";

export const Searchbar = () => {
    const navigation = useNavigate();
    const [search] = useSearchParams();
    const categoryId = search.get('categoryId');
    const name = search.get('name');
    const [value, setvalue] = useState(name || "");
    const debounce = useDevounce<string>(value, 500);
    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setvalue(e.target.value)
    }
    useEffect(() => {
        const result = {
            name: debounce,
            categoryId: categoryId
        };
        const url = qs.stringifyUrl({
            url: window.location.pathname,
            query : result
        }, { skipEmptyString: true, skipNull: true });
        navigation(url);


    }, [navigation , debounce , categoryId]);
    return <div className="relative w-full min-w-md  max-w-md ">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type='text' onChange={onChange} value={value} placeholder="Search..." className="pl-8" />
    </div>
}