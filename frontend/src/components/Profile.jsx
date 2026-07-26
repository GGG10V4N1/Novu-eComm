import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    FaUser,
    FaEnvelope,
    FaIdBadge,
    FaShieldAlt,
    FaAddressBook,
    FaPlus,
    FaKey,
} from "react-icons/fa";
import {
    getUserAddresses,
    deleteUserAddress,
} from "../store/actions";
import UserAddressList from "./user/UserAddressList";
import AddressInfoModal from "./checkout/AddressInfoModal";
import AddAddressForm from "./checkout/AddAddressForm";
import ChangePasswordForm from "./user/ChangePasswordForm";
import ChangeEmailForm from "./user/ChangeEmailForm";
import { DeleteModal } from "./checkout/DeleteModal";
import Skeleton from "./shared/Skeleton";
import toast from "react-hot-toast";

const Profile = () => {
    const dispatch = useDispatch();
    const { user, address: addresses } = useSelector((state) => state.auth);
    const { isLoading, btnLoader } = useSelector((state) => state.errors);

    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openEmailModal, setOpenEmailModal] = useState(false);

    useEffect(() => {
        dispatch(getUserAddresses());
    }, [dispatch]);

    const addNewAddressHandler = () => {
        setSelectedAddress("");
        setOpenAddressModal(true);
    };

    const deleteAddressHandler = () => {
        dispatch(
            deleteUserAddress(
                toast,
                selectedAddress?.addressId,
                setOpenDeleteModal
            )
        );
    };

    if (!user) {
        return (
            <div className="lg:px-14 sm:px-8 px-4 py-14 text-center">
                <p className="text-slate-600">
                    You need to be logged in to view your profile.
                </p>
            </div>
        );
    }

    const initials =
        (user.username || user.email || "")
            .split(/[@\s._-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() || "")
            .join("") || "?";

    const roleBadges = (user.roles || []).filter(Boolean);
    const noAddressExist = !addresses || addresses.length === 0;

    return (
        <div className="lg:px-14 sm:px-8 px-4 py-14 2xl:w-[90%] 2xl:mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 mb-8 border-b border-slate-200">
                <div className="w-20 h-20 rounded-full bg-[image:var(--background-image-button-gradient)] text-white text-2xl font-extrabold flex items-center justify-center shadow-md shrink-0">
                    {initials}
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-slate-800 text-3xl font-bold">
                        {user.username}
                    </h1>
                    <p className="text-slate-600 mt-1">{user.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                        {roleBadges.length > 0 ? (
                            roleBadges.map((role) => (
                                <span
                                    key={role}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                                    <FaShieldAlt className="text-slate-500" size={11} />
                                    {role.replace("ROLE_", "")}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-500 text-sm">
                                No roles assigned
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Account details */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-800 text-xl font-bold">
                        Account details
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { icon: FaUser, label: "Username", value: user.username },
                        { icon: FaEnvelope, label: "Email", value: user.email },
                        { icon: FaIdBadge, label: "User ID", value: user.id },
                    ].map(({ icon: Icon, label, value }) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 p-4 rounded-md bg-white border border-slate-200 shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                <Icon />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    {label}
                                </div>
                                <div className="text-slate-800 font-semibold truncate">
                                    {value ?? "—"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={() => setOpenPasswordModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-custom-blue text-white font-medium rounded-md hover:opacity-90 transition-all">
                        <FaKey size={14} />
                        Change Password
                    </button>
                    <button
                        onClick={() => setOpenEmailModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-md hover:bg-slate-200 transition-all border border-slate-200">
                        <FaEnvelope size={14} />
                        Change Email
                    </button>
                </div>
            </section>

            {/* Addresses */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-800 text-xl font-bold">
                        My addresses
                    </h2>
                    <span className="text-sm text-slate-500">
                        {addresses?.length || 0} saved
                    </span>
                </div>

                {noAddressExist ? (
                    <div className="p-6 rounded-md max-w-md mx-auto flex flex-col items-center justify-center bg-white border border-slate-200">
                        <FaAddressBook size={50} className="text-gray-500 mb-4" />
                        <h3 className="mb-2 text-slate-900 text-center font-semibold text-xl">
                            No address added yet
                        </h3>
                        <p className="mb-6 text-slate-700 text-center">
                            Add your first address to get started.
                        </p>
                        <button
                            onClick={addNewAddressHandler}
                            className="px-4 py-2 bg-custom-blue text-white font-medium rounded-md hover:opacity-90 transition-all inline-flex items-center gap-2">
                            <FaPlus size={14} />
                            Add Address
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="py-4 px-8 max-w-md">
                        <Skeleton />
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <UserAddressList
                                addresses={addresses}
                                setSelectedAddress={setSelectedAddress}
                                setOpenAddressModal={setOpenAddressModal}
                                setOpenDeleteModal={setOpenDeleteModal}
                            />
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={addNewAddressHandler}
                                className="px-4 py-2 bg-custom-blue text-white font-medium rounded-md hover:opacity-90 transition-all inline-flex items-center gap-2">
                                <FaPlus size={14} />
                                Add More
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* Modals (reused from checkout) */}
            <AddressInfoModal
                open={openAddressModal}
                setOpen={setOpenAddressModal}>
                <AddAddressForm
                    address={selectedAddress}
                    setOpenAddressModal={setOpenAddressModal}
                />
            </AddressInfoModal>

            <AddressInfoModal
                open={openPasswordModal}
                setOpen={setOpenPasswordModal}>
                <ChangePasswordForm setOpen={setOpenPasswordModal} />
            </AddressInfoModal>

            <AddressInfoModal
                open={openEmailModal}
                setOpen={setOpenEmailModal}>
                <ChangeEmailForm
                    setOpen={setOpenEmailModal}
                    currentEmail={user.email}
                />
            </AddressInfoModal>

            <DeleteModal
                open={openDeleteModal}
                loader={btnLoader}
                setOpen={setOpenDeleteModal}
                title="Delete Address"
                onDeleteHandler={deleteAddressHandler}
            />
        </div>
    );
};

export default Profile;
