import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { COUNTRIES } from "../../utils/countries";

const CountrySelect = ({ value, onChange, error }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <label
                htmlFor="country"
                className="font-semibold text-sm text-slate-800">
                Country <span className="text-rose-600">*</span>
            </label>

            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <ListboxButton
                        className={`relative text-sm py-2 rounded-md border w-full cursor-default bg-white text-left text-gray-600 sm:text-sm sm:leading-6 ps-2 pe-9 ${
                            error ? "border-rose-500" : "border-slate-700"
                        }`}>
                        <span className="block truncate">{value || "Select country"}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500">
                            <FaChevronDown className="text-sm" />
                        </span>
                    </ListboxButton>
                    <ListboxOptions
                        transition
                        className="absolute bottom-full mb-1 z-10 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-opacity-5 ring-black focus:outline-hidden">
                        {COUNTRIES.map((country) => (
                            <ListboxOption
                                key={country}
                                value={country}
                                className="group relative cursor-default py-2 pl-3 pr-9 text-gray-900 data-focus:bg-indigo-600 data-focus:text-white">
                                <span className="block truncate font-semibold group-data-selected:font-semibold">
                                    {country}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-focus:text-white [.group:not([data-selected])_&]:hidden">
                                    <FaCheck className="text-xl" />
                                </span>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

            {error && (
                <p className="text-xs text-rose-600 mt-0.5">{error.message || "*Country is required"}</p>
            )}
        </div>
    );
};

export default CountrySelect;
