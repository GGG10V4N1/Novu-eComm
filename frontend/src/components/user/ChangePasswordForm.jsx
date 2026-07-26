import React from 'react'
import InputField from '../shared/InputField'
import { useForm } from 'react-hook-form'
import { FaKey } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Spinners from '../shared/Spinners'
import toast from 'react-hot-toast'
import { updateUserPassword } from '../../store/actions'

const ChangePasswordForm = ({ setOpen }) => {
    const dispatch = useDispatch()
    const { btnLoader } = useSelector((state) => state.errors)
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onTouched",
    })

    const onSubmit = async (data) => {
        dispatch(
            updateUserPassword(
                {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                },
                toast,
                reset,
                () => {},
                setOpen
            )
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center items-center mb-4 font-semibold text-2xl text-slate-800 py-2 px-4">
                <FaKey className="mr-2 text-2xl" />
                Change Password
            </div>
            <div className="flex flex-col gap-4">
                <InputField
                    label="Current Password"
                    required
                    id="currentPassword"
                    type="password"
                    showPasswordToggle
                    message="*Current password is required"
                    placeholder="Enter current password"
                    register={register}
                    errors={errors}
                />
                <InputField
                    label="New Password"
                    required
                    id="newPassword"
                    type="password"
                    showPasswordToggle
                    min={6}
                    message="*New password is required (min 6 characters)"
                    placeholder="Enter new password"
                    register={register}
                    errors={errors}
                    extraValidate={{
                        validate: (value) =>
                            value !== watch("currentPassword") ||
                            "New password must be different from current",
                    }}
                />
                <InputField
                    label="Confirm New Password"
                    required
                    id="confirmPassword"
                    type="password"
                    showPasswordToggle
                    message="*Please confirm your new password"
                    placeholder="Re-enter new password"
                    register={register}
                    errors={errors}
                    extraValidate={{
                        validate: (value) =>
                            value === watch("newPassword") ||
                            "Passwords do not match",
                    }}
                />
            </div>
            <button
                disabled={btnLoader}
                className="text-white bg-custom-blue px-4 py-2 rounded-md mt-4 w-full disabled:opacity-60"
                type="submit"
            >
                {btnLoader ? (
                    <>
                        <Spinners /> Loading...
                    </>
                ) : (
                    "Update Password"
                )}
            </button>
        </form>
    )
}

export default ChangePasswordForm
