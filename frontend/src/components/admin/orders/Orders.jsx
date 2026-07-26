import React, { useEffect } from 'react'
import { FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import OrderTable from './OrderTable';
import useOrderFilter from '../../../hooks/useOrderFilter';
import { clearErrors } from '../../../store/actions';

const Orders = () => {
  // const adminOrder = [ ... ];
  // const pagination = { pageNumber: 0, pageSize: 50, totalElements: 11, totalPages: 1, lastPage: true };
  
  const dispatch = useDispatch();
  const {adminOrder, pagination} = useSelector((state) => state.order);

  useOrderFilter();

  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const emptyOrder = !adminOrder || adminOrder?.length ===0;
  return (
    <div className='pb-6 pt-20'>
        {emptyOrder ? (
            <div className='flex flex-col items-center justify-center text-gray-600 py-10'>
                <FaShoppingCart size={50} className='mb-3'/>
                <h2 className='text-2xl font-semibold'>No Orders Placed Yet</h2>
            </div>
        ) : (
           <OrderTable adminOrder={adminOrder} pagination={pagination}/>
        )}
    </div>
  )
}

export default Orders