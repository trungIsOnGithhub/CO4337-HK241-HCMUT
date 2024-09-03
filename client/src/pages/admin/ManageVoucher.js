import { apiGetAllCouponsByProviderId } from 'apis'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'


const ManageVoucher = () => {
  const { current } = useSelector(state => state.user)
  const [coupons, setCoupons] = useState([]); // Thêm state để lưu trữ coupons

  useEffect(() => {
    const fetchDataCoupons = async () => {
      const response = await apiGetAllCouponsByProviderId(current?.provider_id);
      if (response?.success) {
        setCoupons(response.coupons); // Lưu coupons vào state
      }
    }
    fetchDataCoupons();
  }, [current]);


  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Manage Vouchers</h1>
      <ul className="space-y-4">
        {coupons.map(coupon => (
          <li key={coupon._id} className="rounded-lg p-4 border border-gray-200 bg-white shadow-md">
            <h2 className="text-xl font-semibold">{coupon.name}</h2>
            <p className="text-gray-700">Code: <span className="font-medium">{coupon.code}</span></p>
            <p className="text-gray-700">Expiration Date: <span className="font-medium">{coupon.expirationDate.date} {coupon.expirationDate.time}</span></p>
            <p className="text-gray-700">Discount Type: <span className="font-medium">{coupon.discount_type}</span></p>

            {/* Hiển thị tên dịch vụ và giá trị mã giảm giá */}
            <div className="mt-2">
              <h3 className="font-semibold">Applicable Services:</h3>
              <ul className="list-disc list-inside">
                {coupon.discount_type === 'percentage' ? (
                  coupon.percentageDiscount.map(service => {
                    const serviceName = coupon.services.find(s => s._id === service.id)?.name;
                    return (
                      <li key={service.id} className="text-gray-700">
                        {serviceName} - {service.value}% off
                      </li>
                    );
                  })
                ) : (
                  coupon.fixedAmount.map(service => {
                    const serviceName = coupon.services.find(s => s._id === service.id)?.name;
                    return (
                      <li key={service.id} className="text-gray-700">
                        {serviceName} - {service.value} VNĐ off
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageVoucher;