import { useState } from 'react'
import { useForm } from 'react-hook-form';
import { FaUserPlus, FaUser, FaStore } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../shared/InputField';
import { useDispatch } from 'react-redux';
import { registerNewUser } from '../../store/actions';
import toast from 'react-hot-toast';
import Spinners from '../shared/Spinners';
import AuthBackground from './AuthBackground';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: {errors},
    } = useForm({
        mode: "onTouched",
    });

    // El valor del password se observa para validar la confirmacion.
    const passwordValue = watch("password", "");

    const registerHandler = async (data) => {
        // El backend SignUpRequest espera `roles: Set<String>` (acepta
        // "admin", "seller", o undefined => ROLE_USER por defecto). Enviamos
        // ["seller"] cuando el usuario elige seller; si no, omitimos `roles`
        // para que el backend asigne ROLE_USER (comportamiento por defecto).
        // Nunca permitimos "admin" desde el registro publico.
        const payload = {
            username: data.username,
            email: data.email,
            password: data.password,
        };
        if (data.role === "seller") {
            payload.roles = ["seller"];
        }
        dispatch(registerNewUser(payload, toast, reset, navigate, setLoader));
     };

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex justify-center items-center overflow-hidden">
            <AuthBackground />
            <form
                onSubmit={handleSubmit(registerHandler)}
                className="relative z-10 bg-white/95 backdrop-blur-sm sm:w-[450px] w-[360px] shadow-custom py-8 sm:px-8 px-4 rounded-md">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <FaUserPlus className="text-slate-800 text-5xl"/>
                        <h1 className="text-slate-800 text-center font-montserrat lg:text-3xl text-2xl font-bold">
                            Join Novu
                        </h1>
                        <p className="text-slate-600 text-sm">Create your account and start shopping</p>
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
                    label="Email"
                    required
                    id="email"
                    type="email"
                    message="*Email is required"
                    placeholder="Enter your email"
                    register={register}
                    errors={errors}
                    />

                <InputField
                    label="Password"
                    required
                    id="password"
                    min={6}
                    type="password"
                    message="*Password is required"
                    placeholder="Enter your password"
                    register={register}
                    errors={errors}
                    showPasswordToggle
                    />

                <InputField
                    label="Confirm Password"
                    required
                    id="confirmPassword"
                    min={6}
                    type="password"
                    message="*Please confirm your password"
                    placeholder="Re-enter your password"
                    register={register}
                    errors={errors}
                    showPasswordToggle
                    extraValidate={{
                        validate: (value) =>
                            value === passwordValue || "Passwords do not match",
                    }}
                    />

                {/* Selector de rol: el usuario decide si sera usuario normal o
                    seller. No se ofrece "admin" (ese rol solo lo crea el
                    backend en initData o desde la consola). El backend
                    SignUpRequest acepta roles: Set<String> con "seller";
                    si no se envia, asigna ROLE_USER por defecto. */}
                <div className="flex flex-col gap-1 w-full mt-1">
                    <label className="font-semibold text-sm text-slate-800">
                        Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label
                            className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer transition-colors ${
                                watch("role") === undefined || watch("role") === "user"
                                    ? "border-custom-blue bg-custom-blue/10 text-slate-800"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}>
                            <input
                                type="radio"
                                value="user"
                                {...register("role")}
                                defaultChecked
                                className="accent-custom-blue"
                            />
                            <FaUser className="text-slate-600" />
                            <span className="text-sm font-medium">User</span>
                        </label>
                        <label
                            className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer transition-colors ${
                                watch("role") === "seller"
                                    ? "border-custom-blue bg-custom-blue/10 text-slate-800"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}>
                            <input
                                type="radio"
                                value="seller"
                                {...register("role")}
                                className="accent-custom-blue"
                            />
                            <FaStore className="text-slate-600" />
                            <span className="text-sm font-medium">Seller</span>
                        </label>
                    </div>
                </div>
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
                    <>Register</>
                )}
            </button>

            <div className="text-center text-sm text-slate-700 mt-6">
                <p>Already have an account?</p>
                <Link
                    className="font-semibold underline hover:text-black mt-1 inline-block"
                    to="/login">
                    Login
                </Link>
            </div>
            </form>
        </div>
    );
}

export default Register
