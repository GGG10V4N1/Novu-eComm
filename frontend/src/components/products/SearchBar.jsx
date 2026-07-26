import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";

const useProductSearch = () => {
    const [searchParams] = useSearchParams();
    const pathname = useLocation().pathname;
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const currentSearchTerm = searchParams.get("keyword") || "";
        setSearchTerm(currentSearchTerm);
    }, [searchParams]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm) {
                searchParams.set("keyword", searchTerm);
            } else {
                searchParams.delete("keyword");
            }
            navigate(`${pathname}?${searchParams.toString()}`);
        }, 700);

        return () => {
            clearTimeout(handler);
        };
    }, [searchParams, searchTerm, navigate, pathname]);

    return { searchTerm, setSearchTerm };
};

const SearchBar = () => {
    const { searchTerm, setSearchTerm } = useProductSearch();

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Search by name
            </label>
            <div className="relative w-full sm:max-w-md">
                <input
                    type="text"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-slate-300 text-slate-800 rounded-lg py-2 pl-10 pr-9 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Clear search">
                        <FiX size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
