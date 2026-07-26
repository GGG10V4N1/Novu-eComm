import { FaBoxOpen, FaExclamationTriangle, FaSearch } from "react-icons/fa";
import ProductCard from "../shared/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories } from "../../store/actions";
import Filter from "./Filter";
import SearchBar from "./SearchBar";
import useProductFilter from "../../hooks/useProductFilter";
import Loader from "../shared/Loader";
import Paginations from "../shared/Paginations";

const Products = () => {
    const { isLoading, errorMessage } = useSelector(
        (state) => state.errors
    );
    const {products, categories, productPagination: pagination} = useSelector(
        (state) => state.products
    )
    const dispatch = useDispatch();
    useProductFilter();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Determina si hay filtros activos (busqueda por keyword o categoria) para
    // mostrar un mensaje e icono acordes: "sin resultados para tu busqueda"
    // quando hay filtros, o "no hay productos" cuando el catalogo esta vacio.
    const activeKeyword = searchParams.get("keyword");
    const activeCategory = searchParams.get("category");
    const hasActiveFilters = !!(activeKeyword || activeCategory);

    // "Sin productos" se considera cuando:
    //   - la peticion termino (no isLoading),
    //   - no hay errorMessage (los errores los muestra el bloque de error),
    //   - y products es null (sin datos aun) o un array vacio (la BD respondio
    //     con 0 productos).
    const emptyProducts = !isLoading && !errorMessage
        && (!products || products.length === 0);

    return (
        <div className="lg:px-14 sm:px-8 px-4 py-14 2xl:w-[90%] 2xl:mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <Filter categories={categories ? categories : []}/>
                <div className="flex-1 min-w-0">
                    <SearchBar />
            {isLoading ? (
                <Loader />
            ) : errorMessage ? (
                <div className="flex justify-center items-center h-[200px]">
                    <FaExclamationTriangle className="text-slate-800 text-3xl mr-2"/>
                    <span className="text-slate-800 text-lg font-medium">
                        {errorMessage}
                    </span>
                </div>
            ) : emptyProducts ? (
                <div className="flex flex-col items-center justify-center text-gray-600 py-20 min-h-[500px]">
                    {hasActiveFilters ? (
                        <>
                            <FaSearch size={50} className="mb-3 text-slate-400"/>
                            <h2 className="text-2xl font-semibold mb-1">
                                No products match your search
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Try a different keyword or category.
                            </p>
                        </>
                    ) : (
                        <>
                            <FaBoxOpen size={50} className="mb-3 text-slate-400"/>
                            <h2 className="text-2xl font-semibold mb-1">
                                No products available
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Check back later for new arrivals.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="min-h-[700px]">
                    <div className="pb-6 pt-4 grid 2xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-2 gap-y-6 gap-x-6">
                       {products &&
                        products.map((item, i) => <ProductCard key={i} {...item} />
                        )}
                    </div>
                    <div className="flex justify-center pt-10">
                        <Paginations
                            numberOfPage = {pagination?.totalPages}
                            totalProducts = {pagination?.totalElements}/>
                    </div>
                </div>
            )}
                </div>
            </div>
        </div>
    )
}

export default Products;