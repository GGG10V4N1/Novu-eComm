import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLogin } from "react-icons/ai";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InputField from "../shared/InputField";
import { useDispatch } from "react-redux";
import { authenticateSignInUser } from "../../store/actions";
import toast from "react-hot-toast";
import Spinners from "../shared/Spinners";
import AuthBackground from "./AuthBackground";

const LogIn = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("session") === "expired") {
            toast.error("Your session has expired. Please log in again.");
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm({
        mode: "onTouched",
    });

    const loginHandler = async (data) => {
        dispatch(authenticateSignInUser(data, toast, reset, navigate, setLoader));
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex justify-center items-center overflow-hidden">
            <AuthBackground />
            <form
                onSubmit={handleSubmit(loginHandler)}
                className="relative z-10 bg-white/95 backdrop-blur-sm sm:w-[450px] w-[360px] shadow-custom py-8 sm:px-8 px-4 rounded-md">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <AiOutlineLogin className="text-slate-800 text-5xl"/>
                        <h1 className="text-slate-800 text-center font-montserrat lg:text-3xl text-2xl font-bold">
                            Welcome to Novu
                        </h1>
                        <p className="text-slate-600 text-sm">Login to continue shopping</p>
                    </div>
            <hr className="mt-2 mb-5 text-black" />
            <div className="flex flex-col gap-3">
                <InputField
                    label="UserName"
                    required
                    id="username"
                    type="text"
                    message="*UserName is required"
                    placeholder="Enter your username"
                    register={register}
                    errors={errors}
                    />

                <InputField
                    label="Password"
                    required
                    id="password"
                    type="password"
                    message="*Password is required"
                    placeholder="Enter your password"
                    register={register}
                    errors={errors}
                    showPasswordToggle
                    />
            </div>

            <button
                disabled={loader}
                className="bg-button-gradient flex gap-2 items-center justify-center font-semibold text-white w-full py-2 hover:text-slate-400 transition-colors duration-100 rounded-xs my-3"
                type="submit">
                {loader ? (
                    <>
                    <Spinners /> Loading...
                    </>
                ) : (
                    <>Login</>
                )}
            </button>

            <div className="text-center text-sm text-slate-700 mt-6">
                <p>Don't have an account?</p>
                <Link
                    className="font-semibold underline hover:text-black mt-1 inline-block"
                    to="/register">
                    Sign Up
                </Link>
            </div>
            </form>
        </div>
    );
}

export default LogIn;
