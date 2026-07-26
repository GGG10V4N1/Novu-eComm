import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiRefreshCw } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const SORT_OPTIONS = [
    { value: "price", label: "Price" },
    { value: "specialPrice", label: "Special Price" },
    { value: "name", label: "Name" },
    { value: "discount", label: "Discount" },
];

const Filter = ({ categories }) => {
    const [searchParams] = useSearchParams();
    const params = new URLSearchParams(searchParams);
    const pathname = useLocation().pathname;
    const navigate = useNavigate();

    const [category, setCategory] = useState("all");
    const [sortBy, setSortBy] = useState("price");
    const [sortOrder, setSortOrder] = useState("asc");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const currentCategory = searchParams.get("category") || "all";
        const currentSortBy = searchParams.get("sortBy") || "price";
        const currentSortOrder = searchParams.get("sortOrder") || "asc";

        setCategory(currentCategory);
        setSortBy(currentSortBy);
        setSortOrder(currentSortOrder);
    }, [searchParams]);

    const handleCategoryChange = (selectedCategory) => {
        if (selectedCategory === "all") {
            params.delete("category");
        } else {
            params.set("category", selectedCategory);
        }
        navigate(`${pathname}?${params}`);
        setCategory(selectedCategory);
        setMobileFiltersOpen(false);
    };

    const handleSortByChange = (selectedSortBy) => {
        params.set("sortBy", selectedSortBy);
        navigate(`${pathname}?${params}`);
        setSortBy(selectedSortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => {
            const newOrder = (prevOrder === "asc") ? "desc" : "asc";
            params.set("sortOrder", newOrder);
            navigate(`${pathname}?${params}`);
            return newOrder;
        });
    };

    const handleClearFilters = () => {
        navigate({ pathname: window.location.pathname });
        setMobileFiltersOpen(false);
    };

    const activeFiltersCount = [
        category !== "all",
        sortBy !== "price",
    ].filter(Boolean).length;

    return (
        <>
            {/* Mobile toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setMobileFiltersOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-800 font-medium">
                    <span className="flex items-center gap-2">
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                                {activeFiltersCount}
                            </span>
                        )}
                    </span>
                    <span className="text-slate-500">{mobileFiltersOpen ? "Hide" : "Show"}</span>
                </button>
            </div>

            <aside
                className={`
                    lg:sticky lg:top-6 lg:h-fit
                    ${mobileFiltersOpen ? "block" : "hidden"} lg:block
                    w-full lg:w-72 shrink-0
                `}
            >
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 className="text-slate-800 font-semibold">Filters</h3>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className="inline-flex items-center gap-1 text-sm text-rose-700 hover:text-rose-900 font-medium transition-colors">
                                <FiRefreshCw size={14} />
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="p-5 space-y-8">
                        {/* Categories dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full appearance-none border border-slate-300 text-slate-800 rounded-lg py-2 pl-3 pr-10 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
                                    <option value="all">All</option>
                                    {categories?.map((item) => (
                                        <option key={item.categoryId} value={item.categoryName}>
                                            {item.categoryName}
                                        </option>
                                    ))}
                                </select>
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Sort by
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSortByChange(opt.value)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                                            ${sortBy === opt.value
                                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"}
                                        `}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Direction */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Direction
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => sortOrder !== "asc" && toggleSortOrder()}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 flex-1
                                        ${sortOrder === "asc"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}
                                    `}>
                                    <FiArrowUp size={16} />
                                    Asc
                                </button>
                                <button
                                    type="button"
                                    onClick={() => sortOrder !== "desc" && toggleSortOrder()}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 flex-1
                                        ${sortOrder === "desc"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}
                                    `}>
                                    <FiArrowDown size={16} />
                                    Desc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Filter;
