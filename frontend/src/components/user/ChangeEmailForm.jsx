import React from 'react'
import InputField from '../shared/InputField'
import { useForm } from 'react-hook-form'
import { FaEnvelope } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Spinners from '../shared/Spinners'
import toast from 'react-hot-toast'
import { updateUserEmail } from '../../store/actions'

const ChangeEmailForm = ({ setOpen, currentEmail }) => {
    const dispatch = useDispatch()
    const { btnLoader } = useSelector((state) => state.errors)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        mode: "onTouched",
    })

    const onSubmit = async (data) => {
        dispatch(
            updateUserEmail(
                {
                    currentPassword: data.currentPassword,
                    newEmail: data.newEmail,
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
                <FaEnvelope className="mr-2 text-2xl" />
                Change Email
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
                    label="New Email"
                    required
                    id="newEmail"
                    type="email"
                    message="*Valid email is required"
                    placeholder="Enter new email"
                    register={register}
                    errors={errors}
                    extraValidate={
                        currentEmail
                            ? {
                                  validate: (value) =>
                                      value.toLowerCase() !==
                                          currentEmail.toLowerCase() ||
                                      "New email must be different from current",
                              }
                            : {}
                    }
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
                    "Update Email"
                )}
            </button>
        </form>
    )
}

export default ChangeEmailForm
