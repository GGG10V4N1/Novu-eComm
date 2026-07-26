import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { FaCheck } from "react-icons/fa";

const SelectTextField = ({
    label,
    select,
    setSelect,
    lists
}) => {
    // Refleja directamente el estado de la BD: si la lista de categorias llega
    // vacia (desde /public/categories), lo mostramos en el boton del select.
    // Antes el boton quedaba en blanco sin explicacion, y al guardar
    // selectedCategory.categoryId lanzaba TypeError. Ahora el feedback visual
    // es consistente con lo que el backend devolvio.
    const hasCategories = Array.isArray(lists) && lists.length > 0;
    const emptyText = !hasCategories
        ? "No categories available"
        : "Select a category";

    return (
        <Listbox value={select} onChange={setSelect} disabled={!hasCategories}>
        <div className="flex flex-col gap-2 w-full">
            <label
                htmlFor="id"
                className="font-semibold text-sm text-slate-800">
                {label}
            </label>
        
            <div className="relative">
                <ListboxButton 
                className={`relative text-sm py-2 rounded-md border  w-full cursor-default  bg-white  text-left text-gray-600 sm:text-sm sm:leading-6 ${
                    !hasCategories ? "border-red-300 bg-red-50 text-red-500 cursor-not-allowed" : "border-slate-700"
                }`}>
                    <span className="block truncate ps-2">
                        {select?.categoryName || emptyText}
                    </span>
                </ListboxButton>
                {hasCategories && (
                <ListboxOptions
                    transition
                    className="absolute z-10 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-opacity-5 ring-black focus:outline-hidden">
                    {lists?.map((category) => (
                    <ListboxOption key={category.categoryId} value={category} 
                    className="group relative cursor-default py-2 pl-3 pr-9 text-gray-900 data-focus:bg-indigo-600 data-focus:text-white">
                        <span className="block truncate font-semibold group-data-selected:font-semibold">
                            {category.categoryName}
                        </span>

                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-focus:text-white [.group:not([data-selected])_&]:hidden">
                            <FaCheck className="text-xl"/>
                        </span>
                        
                    </ListboxOption>
                    ))}
                </ListboxOptions>
                )}
            </div>
        </div>
    </Listbox>
    );
};

export default SelectTextField;