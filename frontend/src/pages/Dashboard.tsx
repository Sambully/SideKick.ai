import { useEffect, useState } from "react";
import { Navbar } from "../component/Navbar";
import { Sidebar } from "../component/Sidebar";

import axios from "axios";
import Categories from "../component/Categories";

interface Category {
    id: string,
    name: string
}

export function Dashboard() {
    const [categories, setcategories] = useState<Category[]>([]);

    useEffect(() => {
        try {
            const fetchcat = async () => {
                const response = await axios.get("http://localhost:3000/categories");
                const data = response.data;
                setcategories(data);

            }
            fetchcat();
        } catch (err) {
            console.log(err);
        }
    }, [])
    return <div>
        <Navbar />
        <div className="hidden md:flex mt-16 w-20 flex-col insert-y-0 fixed h-full ">
            <Sidebar />
        </div>
        <div className="md:pl-22 pt-18 h-full">
            <Categories data={categories} />
        </div>
    </div>
}