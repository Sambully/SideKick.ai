import qs from "query-string";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Category {
    id: string,
    name: string
}
const Categories = ({ data }: { data: Category[] }) => {
    const navigation = useNavigate();
    const [search] = useSearchParams();
    const categoryId = search.get('categoryId');
    const onClick = (id: string | undefined) => {
        const query = {
            categoryId: id
        };
        const url = qs.stringifyUrl({
            url: window.location.href,
            query: query
        }, { skipNull: true });
        navigation(url);
    }
    return (
        <div className="p-1 w-full overflow-x-auto space-x-2 flex">
            <button className={`
                flex
                text-center
                text-xs
                items-center
                md:text-sm
                px-2
                md:px-4 py-1
                md:py-1
                rounded-md
                bg-primary/10
                hover:opacity-75
                transaction
                ${categoryId === null ? 'bg-primary/30' : 'bg-primary/10'}
                ` } onClick={() => navigation("/Dashboard")} >Latest</button>
            {Array.isArray(data) && data.map((cat) => (
                <button key={cat.id} className={`
                flex
                text-center
                text-xs
                items-center
                md:text-sm
                px-2
                md:px-4 py-1
                md:py-1
                rounded-md
                bg-primary/10
                hover:opacity-75
                transaction
                ${categoryId === cat.id ? 'bg-primary/30' : 'bg-primary/10'}
                `} onClick={() => onClick(cat.id)} >{cat.name}</button>
            ))}
        </div>
    )
}
export default Categories;
