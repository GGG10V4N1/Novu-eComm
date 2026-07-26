import {
    FaBuilding,
    FaEdit,
    FaStreetView,
    FaTrash,
} from "react-icons/fa";
import { MdLocationCity, MdPinDrop, MdPublic } from "react-icons/md";

const UserAddressList = ({
    addresses,
    setSelectedAddress,
    setOpenAddressModal,
    setOpenDeleteModal,
}) => {
    const onEditButtonHandler = (address) => {
        setSelectedAddress(address);
        setOpenAddressModal(true);
    };

    const onDeleteButtonHandler = (address) => {
        setSelectedAddress(address);
        setOpenDeleteModal(true);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((address) => (
                <div
                    key={address.addressId}
                    className="p-4 border border-slate-200 rounded-md bg-white relative hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-start">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <FaBuilding
                                    size={14}
                                    className="mr-2 text-gray-600"
                                />
                                <p className="font-semibold text-slate-800">
                                    {address.buildingName}
                                </p>
                            </div>

                            <div className="flex items-center">
                                <FaStreetView
                                    size={17}
                                    className="mr-2 text-gray-600"
                                />
                                <p className="text-slate-700">{address.street}</p>
                            </div>

                            <div className="flex items-center">
                                <MdLocationCity
                                    size={17}
                                    className="mr-2 text-gray-600"
                                />
                                <p className="text-slate-700">
                                    {address.city}, {address.state}
                                </p>
                            </div>

                            <div className="flex items-center">
                                <MdPinDrop
                                    size={17}
                                    className="mr-2 text-gray-600"
                                />
                                <p className="text-slate-700">{address.pincode}</p>
                            </div>

                            <div className="flex items-center">
                                <MdPublic
                                    size={17}
                                    className="mr-2 text-gray-600"
                                />
                                <p className="text-slate-700">{address.country}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 absolute top-4 right-2">
                        <button
                            type="button"
                            onClick={() => onEditButtonHandler(address)}
                            aria-label="Edit address">
                            <FaEdit size={18} className="text-teal-700" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDeleteButtonHandler(address)}
                            aria-label="Delete address">
                            <FaTrash size={17} className="text-rose-600" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserAddressList;
