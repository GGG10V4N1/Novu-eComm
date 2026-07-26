import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputField = ({
    label,
    id,
    type,
    errors,
    register,
    required,
    message,
    className,
    min,
    step,
    minValue,
    maxValue,
    minMessage,
    maxMessage,
    placeholder,
    showPasswordToggle = false,
    extraValidate,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password" && showPasswordToggle;
    const isNumeric = type === "number";
    const resolvedType = isPassword
        ? showPassword
            ? "text"
            : "password"
        : type;

    const numericRules = isNumeric
        ? {
              ...(minValue !== undefined
                  ? {
                        min: {
                            value: minValue,
                            message: minMessage || `Value must be at least ${minValue}`,
                        },
                    }
                  : null),
              ...(maxValue !== undefined
                  ? {
                        max: {
                            value: maxValue,
                            message: maxMessage || `Value must be at most ${maxValue}`,
                        },
                    }
                  : null),
          }
        : {};

    return (
        <div className="flex flex-col gap-1 w-full">
            <label
                htmlFor={id}
                className={`${
                    className ? className : ""
                } font-semibold text-sm text-slate-800`}>
                {label}
            </label>
            <div className="relative w-full">
                <input
                    type={resolvedType}
                    id={id}
                    placeholder={placeholder}
                    step={step}
                    className={`w-full ${
                        className ? className : ""
                    } px-2 py-2 border-2 outline-hidden bg-transparent text-slate-800 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-custom-blue/40 ${
                        errors[id]?.message ? "border-red-500" : "border-custom-blue"
                    } ${isPassword ? "pr-10" : ""}`}
                    {...register(id, {
                        required: {value: required, message},
                        minLength: isNumeric
                            ? null
                            : min
                            ? { value: min, message: `Minimum ${min} character is required`}
                            : null,
                        ...numericRules,
                        pattern:
                            type === "email"
                                ? {
                                    value: /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+com+$/,
                                    message: "Invalid email"
                                }
                                : type === "url"
                                ? {
                                    value: /^(https?:\/\/)?(([a-zA-Z0-9\u00a1-\uffff-]+\.)+[a-zA-Z\u00a1-\uffff]{2,})(:\d{2,5})?(\/[^\s]*)?$/,
                                    message: "Please enter a valid url"
                                }
                                : null,
                        ...(extraValidate || {}),
                    })}
                    />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>

            {errors[id]?.message && (
                <p className="text-sm font-semibold text-red-600 mt-0">
                    {errors[id]?.message}
                </p>
            )}
        </div>
    );
};

export default InputField;
