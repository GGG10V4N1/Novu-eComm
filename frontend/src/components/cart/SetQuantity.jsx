const btnStyles = "border-[1.2px] border-slate-800 px-3 py-1 rounded-sm";
const inputStyles =
    "w-12 text-center border-[1.2px] border-slate-800 rounded-sm px-1 py-1 focus:outline-none focus:border-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const SetQuantity = ({
    quantity,
    cardCounter,
    handeQtyIncrease,
    handleQtyDecrease,
    handeQtyChange,
}) => {
    const handleChange = (e) => {
        if (!handeQtyChange) return;
        handeQtyChange(e.target.value, false);
    };

    const handleBlur = (e) => {
        if (!handeQtyChange) return;
        handeQtyChange(e.target.value, true);
    };

    return (
        <div className="flex gap-8 items-center">
            {cardCounter ? null : <div className="font-semibold">QUANTITY</div>}
            <div className="flex md:flex-row flex-col gap-4 items-center lg:text-[22px] text-sm">
                <button
                    disabled={quantity <= 1}
                    className={btnStyles}
                    onClick={handleQtyDecrease}>
                    -
                </button>
                <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputStyles}
                />
                <button
                    className={btnStyles}
                    onClick={handeQtyIncrease}>
                    +
                </button>
            </div>
        </div>
    );
};

export default SetQuantity;
