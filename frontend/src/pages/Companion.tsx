import { Navbar } from "@/component/Navbar"
import { Sidebar } from "@/component/Sidebar"
import { useState, useEffect } from "react";
import axios from "axios";
import CompanionForm from "@/component/CompanionForm";

interface Companionprop {
    params: { companionId: string }
}
const Companion = ({ params }: Companionprop) => {

    const [companion, setcompanion] = useState();
    const [categories, setcategories] = useState();
    useEffect(() => {
        // const fetch = async () => {
        //     const response = await axios.get(`http://localhost:3000/companion/${params.companionId}`);
        //     const cato = await axios.get(`http://localhost:3000/categories`);
        //     setcompanion(response.data);
        //     setcategories(cato.data);
        // }
        // fetch();
        const fetch = async () => {
            try {
                const cato = await axios.get('http://localhost:3000/categories');
                setcategories(cato.data);
            } catch (err) {
                console.error("Error while fetching catogries : ", err);
            }
            try {
                const response = await axios.get(`http://localhost:3000/companion/${params.companionId}`);
                setcompanion(response.data);
            } catch (err) {
                console.error("Error while fetching companion : ", err);
            }
        }
        fetch();
    }, []);



    return <div>
        <Navbar />
        <div className="hidden md:flex mt-16 w-20 flex-col insert-y-0 fixed h-full ">
            <Sidebar />
        </div>
        <div className="md:pl-22 pt-18 h-full">
            <CompanionForm initialData={companion} categories={categories} />

        </div>
    </div>
}
export default Companion