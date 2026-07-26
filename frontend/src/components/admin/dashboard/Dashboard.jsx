import React, { useEffect } from 'react'
import DashboardOverview from './DashboardOverview'
import DashboardCharts from './DashboardCharts'
import { FaBoxOpen, FaDollarSign, FaShoppingCart } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { analyticsAction, sellerAnalyticsAction, clearErrors, getDashboardOrdersForCharts } from '../../../store/actions';
import Loader from '../../shared/Loader';
import ErrorPage from '../../shared/ErrorPage';

const Dashboard = () => {
  const dispatch = useDispatch();
  const {isLoading, errorMessage} = useSelector((state) => state.errors);
  const { 
    analytics: { productCount, totalRevenue, totalOrders },
    dashboardOrders,
   } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");

   useEffect(() => {
     dispatch({ type: "CLEAR_DASHBOARD_DATA" });
     dispatch(isAdmin ? analyticsAction() : sellerAnalyticsAction());
     dispatch(getDashboardOrdersForCharts(isAdmin));
    }, [dispatch, isAdmin]);

   useEffect(() => {
     dispatch(clearErrors());
    }, [dispatch]);

   if (isLoading) {
    return <Loader />
   }

   if (errorMessage) {
    return <ErrorPage message={errorMessage}/>;
   }
   
  return (
    <div>
      <div className='flex md:flex-row mt-8 flex-col lg:justify-between 
          border border-slate-400 rounded-lg bg-linear-to-r
           from-blue-50 to-blue-100 shadow-lg'>
            <DashboardOverview 
              title="Total Products"
              amount={productCount}
              Icon={FaBoxOpen}
            />

            <DashboardOverview 
              title="Total Orders"
              amount={totalOrders}
              Icon={FaShoppingCart}
            />

            <DashboardOverview 
              title="Total Revenue"
              amount={totalRevenue}
              Icon={FaDollarSign}
              revenue
            />
      </div>

      <DashboardCharts orders={dashboardOrders} />
    </div>
  )
}

export default Dashboard