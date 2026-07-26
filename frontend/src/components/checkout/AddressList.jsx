import React from 'react'
import { FaBuilding, FaCheckCircle, FaEdit, FaStreetView, FaTrash } from 'react-icons/fa';
import { MdLocationCity, MdPinDrop, MdPublic } from "react-icons/md";
import { BsCheckCircleFill, BsCircle } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux'
import { clearCheckoutAddress, selectUserCheckoutAddress } from '../../store/actions';

const AddressList = ({ addresses, setSelectedAddress, setOpenAddressModal, setOpenDeleteModal }) => {
    const dispatch = useDispatch();
    const { selectedUserCheckoutAddress } = useSelector((state) => state.auth);

    const onEditButtonHandler = (addresses) => {
        setSelectedAddress(addresses);
        setOpenAddressModal(true);
    };

    const onDeleteButtonHandler = (addresses) => {
        setSelectedAddress(addresses);
        setOpenDeleteModal(true);
    };

    const handleAddressSelection = (addresses) => {
        const isSelected = selectedUserCheckoutAddress?.addressId === addresses.addressId;
        if (isSelected) {
            // Toggle: deselecciona si ya estaba seleccionada
            dispatch(clearCheckoutAddress());
        } else {
            dispatch(selectUserCheckoutAddress(addresses));
        }
    };

  return (
    <div className='space-y-4'>
        {addresses.map((address) => {
            const isSelected = selectedUserCheckoutAddress?.addressId === address.addressId;
            return (
            <div
                key={address.addressId}
                onClick={() => handleAddressSelection(address)}
                className={`p-4 border-2 rounded-md cursor-pointer relative transition-all duration-200 ${
                    isSelected
                    ? "bg-green-50 border-green-500 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}>
                <div className="flex items-start">
                    {/* Indicador visual de selección (radio) */}
                    <div className="mr-3 mt-1">
                        {isSelected ? (
                            <BsCheckCircleFill className="text-green-600 text-xl" />
                        ) : (
                            <BsCircle className="text-gray-300 text-xl" />
                        )}
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center ">
                            <FaBuilding size={14} className='mr-2 text-gray-600' />
                            <p className='font-semibold'>{address.buildingName}</p>
                        </div>

                        <div className="flex items-center ">
                            <FaStreetView size={17} className='mr-2 text-gray-600' />
                            <p>{address.street}</p>
                        </div>

                        <div className="flex items-center ">
                            <MdLocationCity size={17} className='mr-2 text-gray-600' />
                            <p>{address.city}, {address.state}</p>
                        </div>

                        <div className="flex items-center ">
                            <MdPinDrop size={17} className='mr-2 text-gray-600' />
                            <p>{address.pincode}</p>
                        </div>

                        <div className="flex items-center ">
                            <MdPublic size={17} className='mr-2 text-gray-600' />
                            <p>{address.country}</p>
                        </div>
                    </div>
                </div>


                <div className="flex gap-3 absolute top-4 right-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditButtonHandler(address);
                        }}>
                        <FaEdit size={18} className="text-teal-700" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteButtonHandler(address);
                        }}>
                        <FaTrash size={17} className="text-rose-600" />
                    </button>
                </div>
            </div>
            );
        })}
    </div>
  )
}

export default AddressList