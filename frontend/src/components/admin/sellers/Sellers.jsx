import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SellerTable from "./SellerTable";
import ErrorPage from "../../shared/ErrorPage";
import Loader from "../../shared/Loader";
import useSellerFilter from "./useSellerFilter";
import { clearErrors } from "../../../store/actions";

const Sellers = () => {
  const dispatch = useDispatch();
  const { sellers, pagination } = useSelector((state) => state.seller);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);

  // Calling the `useSellerFilter` custom hook to fetch sellers and pagination based on the current URL parameters.
  useSellerFilter();

  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const emptySellers = !sellers || sellers?.length === 0;

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <React.Fragment>
      {/* El admin ya no registra sellers desde aqui: los nuevos sellers se
          crean a si mismos desde el formulario de registro publico (/register),
          donde eligen su rol (usuario normal o seller). Aqui solo se LISTAN
          los sellers existentes para que el admin tenga visibilidad. */}
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-slate-800 text-3xl text-center font-bold uppercase">
          All Sellers
        </h1>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-md">
          New sellers register themselves from the sign-up page by selecting the
          seller role.
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {emptySellers ? (
            <>
              <div className="flex flex-col items-center justify-center text-gray-600 py-10">
                <h2 className="text-2xl font-semibold">
                  No Seller Created Yet
                </h2>
              </div>
            </>
          ) : (
            <SellerTable sellers={sellers} pagination={pagination} />
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default Sellers;