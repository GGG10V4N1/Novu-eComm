import { useEffect, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import SetQuantity from "./SetQuantity";
import { useDispatch } from "react-redux";
import { decreaseCartQuantity, increaseCartQuantity, removeFromCart, setCartQuantity } from "../../store/actions";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/formatPrice";
import truncateText from "../../utils/truncateText";

const ItemContent = ({
    productId,
    productName,
    image,
    description,
    quantity,
    price,
    discount,
    specialPrice,
    cartId,
  }) => {
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const [inputValue, setInputValue] = useState(quantity);
    const dispatch = useDispatch();

    // Sincroniza el estado local cuando la prop quantity cambia externamente
    // (ej. reconciliacion del carrito contra la BD)
    useEffect(() => {
        setCurrentQuantity(quantity);
        setInputValue(quantity);
    }, [quantity]);

    const setBoth = (q) => {
        setCurrentQuantity(q);
        setInputValue(q);
    };

    const handleQtyIncrease = (cartItems) => {
        dispatch(increaseCartQuantity(
            cartItems,
            toast,
            currentQuantity,
            setBoth
        ));
    };

    const handleQtyDecrease = (cartItems) => {
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            setCurrentQuantity(newQuantity);
            setInputValue(newQuantity);
            dispatch(decreaseCartQuantity(cartItems, newQuantity));
        }
    };

    const handleQtyChange = (cartItems, value, isBlur) => {
        setInputValue(value);

        if (value === "") {
            if (isBlur) {
                setInputValue(currentQuantity);
            }
            return;
        }

        dispatch(setCartQuantity(
            cartItems,
            value,
            toast,
            (q) => {
                setCurrentQuantity(q);
                setInputValue(q);
            }
        ));
    };

    const removeItemFromCart = (cartItems) => {
        dispatch(removeFromCart(cartItems, toast));
    };
    
    return (
        <div className="grid md:grid-cols-6 grid-cols-4 md:text-md text-sm gap-4 items-center border border-slate-200 rounded-md lg:px-4 py-4 p-2">
            <div className="justify-self-start flex flex-col gap-2">
                <div className="flex md:flex-row flex-col lg:gap-4 sm:gap-3 gap-0 items-start">
                   <h3 className="lg:text-[17px] text-sm font-semibold text-slate-600">
                    {truncateText(productName)}
                   </h3>
                </div>

                <div className="md:w-36 sm:w-24 w-12">
                    <img 
                        src={`${import.meta.env.VITE_BACK_END_URL}/images/${image}`}
                        alt={productName}
                        className="md:h-36 sm:h-24 h-12 w-full object-cover rounded-md"/>
                </div>

                <div className="flex items-start gap-5 mt-3">
                    <button
                        onClick={() => removeItemFromCart({
                            image,
                            productName,
                            description,
                            specialPrice,
                            price,
                            productId,
                            quantity,
                        })}
                        className="flex items-center font-semibold space-x-2 px-4 py-1 text-xs border border-rose-600 text-rose-600 rounded-md hover:bg-red-50 transition-colors duration-200">
                        <HiOutlineTrash size={16} className="text-rose-600"/>
                        Remove
                    </button>
                </div>
            </div>

            <div className="hidden md:block lg:text-[14px] text-sm text-slate-600">
                {truncateText(description, 120)}
            </div>

            <div className="justify-self-center lg:text-[17px] text-sm text-slate-600 font-semibold">
                {formatPrice(Number(specialPrice))}
            </div>

            <div className="justify-self-center">
                <SetQuantity 
                    quantity={inputValue}
                    cardCounter={true}
                    handeQtyIncrease={() => handleQtyIncrease({
                        image,
                        productName,
                        description,
                        specialPrice,
                        price,
                        productId,
                        quantity,
                    })}
                    handleQtyDecrease={() => {handleQtyDecrease({
                        image,
                        productName,
                        description,
                        specialPrice,
                        price,
                        productId,
                        quantity,
                    })}}
                    handeQtyChange={(value, isBlur) => handleQtyChange({
                        image,
                        productName,
                        description,
                        specialPrice,
                        price,
                        productId,
                        quantity,
                    }, value, isBlur)}/>
            </div>

            <div className="justify-self-center lg:text-[17px] text-sm text-slate-600 font-semibold">
                {formatPrice(Number(currentQuantity) * Number(specialPrice))}
            </div>
        </div>
    )
};

export default ItemContent;