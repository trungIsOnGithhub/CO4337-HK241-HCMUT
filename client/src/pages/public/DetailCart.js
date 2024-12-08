import { Breadcrumb, Button, OrderItem} from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo, useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatPrice, formatPricee } from 'ultils/helper'
import path from 'ultils/path'
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleDown, FaAngleUp, FaExclamationCircle, FaLock, FaShippingFast } from 'react-icons/fa'
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import defaultProvider from '../../assets/defaultProvider.jpg'
import { apiGetCouponsByProductsId, apiRemoveCartProduct } from 'apis'
import { getCurrent } from 'store/user/asyncAction'
import clsx from 'clsx'


const DetailCart = () => {
    const {currentCartProduct, current} = useSelector(state => state.user)
    const location = useLocation()
    const navigate = useNavigate()
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");
    const [itemToRemove, setItemToRemove] = useState(null);
    const dispatch = useDispatch()
    const [groupedProducts, setGroupedProducts] = useState({});
    const [couponsByProvider, setCouponsByProvider] = useState({});
    const [showVoucher, setShowVoucher] = useState([])
    const [selectedVouchers, setSelectedVouchers] = useState({});
    const userLatitude = current?.latitude;
    const userLongitude = current?.longitude;
    const [shippingPrices, setShippingPrices] = useState({});

     // Nhóm các sản phẩm theo provider
    useEffect(() => {
      const grouped = currentCartProduct?.reduce((acc, item) => {
          const providerId = item?.provider?._id;
          if (!acc[providerId]) {
              acc[providerId] = {
                  provider: item.provider,
                  products: [],
              };
          }
          acc[providerId].products.push(item);
          return acc;
      }, {});
      setGroupedProducts(grouped);
    }, [currentCartProduct]);

  // Gọi API để lấy coupon cho mỗi nhà cung cấp
  useEffect(() => {
      const fetchCouponsForProviders = async () => {
          const couponsData = {};
          for (const providerId in groupedProducts) {
              const productIds = groupedProducts[providerId].products.map(
                  (product) => product?.productId
              );
              if (productIds.length > 0) {
                  try {
                      const response = await apiGetCouponsByProductsId({productIds: [...new Set(productIds)]});
                      if (response.success) {
                          couponsData[providerId] = response.coupons; // Giả sử API trả về mảng coupon
                      }
                  } catch (error) {
                      console.error('Failed to fetch coupons:', error);
                  }
              }
          }
          setCouponsByProvider(couponsData);
      };

      if (Object.keys(groupedProducts).length > 0) {
          fetchCouponsForProviders();
      }
    }, [groupedProducts]);

    // const handleSubmit = () => {
    //     if(!current?.address){
    //         return Swal.fire({
    //             icon: 'info',
    //             title: 'Update your address',
    //             text: 'You need address to checkout',
    //             showCancelButton: true,
    //             showConfirmButton: true,
    //             confirmButtonText: 'Update address',
    //             cancelButtonText: 'Cancel'
    //         }).then((rs) => { 
    //             if(rs.isConfirmed){
    //                 navigate({
    //                     pathname:  `/${path.USER}/${path.PERSONAL}`,
    //                     search: createSearchParams({redirect: location.pathname}).toString()
    //                 })
    //             }
    //          })
    //     }
    //     else{
    //         window.open(`/${path.CHECKOUT_PRODUCT}`, '_blank')
    //     }
    // }

    const confirmRemove = async() => {
        if (itemToRemove) {
            const response = await apiRemoveCartProduct(itemToRemove?.productId, itemToRemove?.colorCode)
            if(response.success){
                dispatch(getCurrent())
            } 
        }
        setShowConfirmation(false);
        setItemToRemove(null);
    } 

    const initiateRemove = (productId, colorCode) => {
        setItemToRemove({ productId, colorCode });
        setShowConfirmation(true);
      };

    const handleSelectedVoucher = (providerId, voucher) => {
      setSelectedVouchers((prev) => ({
        ...prev,
        [providerId]: prev[providerId]?._id === voucher._id ? null : voucher
      }));
    };

    const calculateDiscount = (coupon, products) => {
      let discountAmount = 0;
  
      if (coupon?.discount_type === "percentage") {
          coupon?.percentageDiscountProduct.forEach((discount) => {
            const matchedProducts = products.filter((p) => p.productId === discount.id);
        
            // Lặp qua tất cả các sản phẩm thỏa mãn và tính tổng giảm giá
            matchedProducts.forEach((product) => {
                discountAmount += (product?.price * discount?.value) / 100 * product?.quantity;
            });
          });
      } else if (coupon?.discount_type === "fixed") {
          coupon?.fixedAmountProduct.forEach((discount) => {
              const matchedProducts = products.filter((p) => p.productId === discount.id);
              matchedProducts.forEach((product) => {
                discountAmount += discount?.value * product?.quantity;
              });
          });
      }
  
      return discountAmount;
  };

    // Tính giá sau khi giảm cho sản phẩm
    const calculateDiscountedPrice = (product, providerId) => {
      const selectedVoucher = selectedVouchers[providerId];
      let discountedPrice = product.price;

      if (selectedVoucher && selectedVoucher.discount_type === "percentage") {
        const discount = selectedVoucher.percentageDiscountProduct.find(
          (d) => d.id === product.productId
        );
        if (discount) {
          discountedPrice -= (product.price * discount.value) / 100;
        }
      } 
      else if (selectedVoucher && selectedVoucher.discount_type === "fixed") {
        const discount = selectedVoucher.fixedAmountProduct.find(
          (d) => d.id === product.productId
        );
        if (discount) {
          discountedPrice -= discount.value;
        }
      }

      return discountedPrice;
    };

    // Kiểm tra sản phẩm có mã giảm giá áp dụng không
  const isDiscountedProduct = (product, providerId) => {
    const selectedVoucher = selectedVouchers[providerId];
    if (!selectedVoucher) return false;

    if (selectedVoucher.discount_type === "percentage") {
      return selectedVoucher.percentageDiscountProduct.some(
        (discount) => discount.id === product.productId
      );
    } else if (selectedVoucher.discount_type === "fixed") {
      return selectedVoucher.fixedAmountProduct.some(
        (discount) => discount.id === product.productId
      );
    }
    return false;
  };

  const handleCheckoutProduct = () => {
    if(!current?.address || !current?.longitude || !current?.latitude){
      return Swal.fire({
          icon: 'info',
          title: 'Update your address',
          text: 'You need address to checkout',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Update address',
          cancelButtonText: 'Cancel'
      }).then((rs) => { 
          if(rs.isConfirmed){
              navigate({
                  pathname:  `/${path.USER}/${path.PERSONAL}`,
                  search: createSearchParams({redirect: location.pathname}).toString()
              })
          }
       })
    }
    else{
        const providerProductDetails = Object.keys(groupedProducts).map(providerId => {
          const provider = groupedProducts[providerId];
        
          // Lặp qua từng sản phẩm của provider và lấy thông tin chi tiết
          const productsDetails = provider.products.map(product => {
            const discountPrice = calculateDiscountedPrice(product, providerId); // Tính giá sau giảm giá
        
            return {
              productId: product?.productId,           // Product ID
              variantId: product?.variantId,         // Variant ID
              quantity: product?.quantity,           // Quantity of the product
              color: product?.color,                 // Product color
              colorCode: product?.colorCode,         // Color code
              originalPrice: product?.price,         // Original price of the product
              discountPrice: discountPrice,         // Discounted price (calculated by function)
              thumb: product?.thumb,                 // Thumbnail image URL
              title: product?.title                  // Product title
            };
          });
          
          return {
            providerId: provider.provider._id,
            products: productsDetails
          };
        });

        const providerTotalProductPrice = Object.keys(groupedProducts).map(providerId => {
          const provider = groupedProducts[providerId];
          
          // Tính tổng tiền của các sản phẩm trong provider
          const totalPrice = provider.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
          
          return {
            providerId: provider.provider._id,
            totalPrice: totalPrice
          };
        });
        const providerTotalSavingPrice = Object.keys(groupedProducts).map(providerId => {
          const provider = groupedProducts[providerId];
          
          // Tính tổng tiền của các sản phẩm trong provider
          const totalSavings = calculateDiscount(selectedVouchers[providerId], provider.products);
          
          return {
            providerId: provider.provider._id,
            totalSavings: totalSavings
          };
        });
        // // removed log
        const providerTotalShippingPrice = Object.keys(groupedProducts).map(providerId => {
          const provider = groupedProducts[providerId];
          const shippingPrice = shippingPrices[providerId];

          return {
            providerId: provider.provider._id,
            shippingPrice: shippingPrice
          };
        });
        // // removed log
        const providerTotalPrice = Object.keys(groupedProducts).map(providerId => {
          // Tìm totalProductPrice, totalSavings và shippingPrice cho mỗi provider
          const totalProductPrice = providerTotalProductPrice.find(el => el.providerId === providerId)?.totalPrice || 0;
          const totalSavings = providerTotalSavingPrice.find(el => el.providerId === providerId)?.totalSavings || 0;
          const shippingPrice = providerTotalShippingPrice.find(el => el.providerId === providerId)?.shippingPrice || 0;
        
          // Tính tổng tiền cho provider
          const totalPrice = totalProductPrice + shippingPrice - totalSavings;
        
          return {
            providerId: providerId,
            totalPrice: totalPrice
          };
        });
        // // removed log
        const providerSelectedDiscount = Object.keys(groupedProducts).map(providerId => {
          const provider = groupedProducts[providerId];
          const selectedVoucher = selectedVouchers[providerId];
          return {
            providerId: provider.provider._id,
            selectedDiscount: selectedVoucher
          };
        });
        const totalPrice = calculateTotalProductPrice() + calculateTotalShippingPrice() - calculateTotalSavings()
        const totalProductPrice = calculateTotalProductPrice();
        const totalShippingPrice = calculateTotalShippingPrice();
        const totalSavings = calculateTotalSavings();

        // Lưu vào sessionStorage
        sessionStorage.setItem('providerProductDetails', JSON.stringify(providerProductDetails));
        sessionStorage.setItem('providerTotalProductPrice', JSON.stringify(providerTotalProductPrice));
        sessionStorage.setItem('providerTotalSavingPrice', JSON.stringify(providerTotalSavingPrice));
        sessionStorage.setItem('providerTotalShippingPrice', JSON.stringify(providerTotalShippingPrice));
        sessionStorage.setItem('providerTotalPrice', JSON.stringify(providerTotalPrice));
        sessionStorage.setItem('providerSelectedDiscount', JSON.stringify(providerSelectedDiscount));
        sessionStorage.setItem('totalPrice', JSON.stringify(totalPrice));
        sessionStorage.setItem('totalProductPrice', JSON.stringify(totalProductPrice));
        sessionStorage.setItem('totalShippingPrice', JSON.stringify(totalShippingPrice));
        sessionStorage.setItem('totalSavings', JSON.stringify(totalSavings));
        
        navigate(`/${path.CHECKOUT_PRODUCT}`);
    }
  }


  const GOONG_API_KEY = '2jcRRCquuKp2hdK4BcQsMZLsrJuXSNuXYlfcWXyA';

  const calculateShippingPrice = async (providerData) => {
    if (userLatitude && userLongitude && providerData?.latitude && providerData?.longitude) {
      const directionsResponse = await fetch(`https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${providerData?.latitude},${providerData?.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`);
      const data = await directionsResponse.json();
      if (data && data.routes && data.routes.length > 0) {
        return Math.round(data.routes[0].legs[0].distance.value / 1000) * 500 ; // Set distance in kilometers
      }
    }
    else return 20000;
  }

  useEffect(() => {
    const calculateAllShippingPrice = async () => {
        const newShippingPrices = {};
        for (const providerId in groupedProducts) {
            const distance = await calculateShippingPrice(groupedProducts[providerId].provider);
            newShippingPrices[providerId] = distance;
        }
        setShippingPrices(newShippingPrices);
    };

    calculateAllShippingPrice();
}, [groupedProducts]);

  const calculateTotalProductPrice = () => {
    let total = 0;
    for (const providerId in groupedProducts) {
      const products = groupedProducts[providerId].products;
      products.forEach((product) => {
        total += product?.price * product?.quantity;
      });
    }
    return total;
  };
  const calculateTotalShippingPrice = () => {
    let totalShipping = 0;
    for (const providerId in shippingPrices) {
      totalShipping += shippingPrices[providerId] || 0;
    }
    return totalShipping;
  };
  const calculateTotalSavings = () => {
    let totalSavings = 0;
    for (const providerId in groupedProducts) {
      const products = groupedProducts[providerId].products;
      const selectedVoucher = selectedVouchers[providerId];
      if (selectedVoucher) {
        totalSavings += calculateDiscount(selectedVoucher, products);
      }
    }
    return totalSavings;
  };

  const canUseDiscount = (coupon) => {
    if (!current) return false;
    const { date, time } = coupon.expirationDate;
    const expirationDateTime = new Date(`${date.split('/').reverse().join('-')}T${time}:00`); // Chuyển đổi sang ISO format

    // Kiểm tra nếu thời gian hết hạn đã qua
    const now = new Date();
    if (expirationDateTime < now) return false;

    const userUsage = coupon.usedBy.find(usage => usage.user.toString() === current._id);
    
    return coupon.noLimitPerUser || !userUsage || userUsage.usageCount < coupon.limitPerUser;
  };

  // removed log
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <FiShoppingCart className="text-[#0a66c2]" />
              Shopping Cart
            </h1>
            <div className="text-gray-500 flex items-center gap-2">
              <FaLock className="text-green-500" />
              Secure Checkout
            </div>
          </div>
  
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center"
                role="alert"
              >
                <FaExclamationCircle className="mr-2" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
  
          <div className="space-y-8">
            {Object.values(groupedProducts)?.map((seller, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 border-b border-gray-200 flex items-center gap-4">
                  <img
                    src={seller?.provider?.images[0] || defaultProvider}
                    alt={seller?.provider?.bussinessName}
                    className="w-12 h-12 object-cover rounded-full border-2 border-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                    }}
                  />
                  <h2 className="text-xl font-bold text-white">
                    {seller?.provider?.bussinessName}
                  </h2>
                </div>
  
                <div className="divide-y divide-gray-200">
                  {seller?.products?.map((product) => (
                    <div
                      key={product?.id}
                      className="p-6 flex flex-col sm:flex-row items-center gap-6 transition-all hover:bg-gray-50"
                    >
                      <div className="relative">
                        <img
                          src={product?.thumb}
                          alt={product?.title}
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                          }}
                        />
                      </div>
  
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {product?.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          {isDiscountedProduct(product, seller?.provider?._id) ? (
                            <>
                              <span className="text-xl font-bold text-gray-500 line-through">
                                {`${formatPrice(formatPricee(product?.price))} VNĐ`}
                              </span>
                              <span className="text-2xl font-bold text-[#0a66c2]">
                                {`${formatPrice(formatPricee(calculateDiscountedPrice(product, seller?.provider?._id)))} VNĐ`}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-[#0a66c2]">
                              {`${formatPrice(formatPricee(product?.price))} VNĐ`}
                            </span>
                          )}
                        </div>
                      </div>
  
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center border-2 border-indigo-100 rounded-lg bg-white shadow-sm">
                          <button
                            // onClick={() =>
                            //   updateQuantity(seller.sellerId, product.id, false)
                            // }
                            className="p-3 hover:bg-indigo-50 transition-colors rounded-l-lg"
                            aria-label="Decrease quantity"
                            // disabled={!product.inStock}
                          >
                            <FiMinus className="w-5 h-5 text-indigo-600" />
                          </button>
                          <span className="px-6 py-2 text-lg font-semibold text-gray-900 border-x-2 border-indigo-100">
                            {product?.quantity}
                          </span>
                          <button
                            // onClick={() =>
                            //   updateQuantity(seller.sellerId, product.id, true)
                            // }
                            className="p-3 hover:bg-indigo-50 transition-colors rounded-r-lg"
                            aria-label="Increase quantity"
                            // disabled={!product.inStock}
                          >
                            <FiPlus className="w-5 h-5 text-indigo-600" />
                          </button>
                        </div>
  
                        <button
                          onClick={() => initiateRemove(product?.product, product?.colorCode)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 p-6 text-[#0a66c2] font-semibold">
                  <FaShippingFast />
                  Shipping: 
                  {shippingPrices[seller?.provider?._id] != null ? ` ${formatPrice(formatPricee(shippingPrices[seller?.provider?._id]))} VNĐ` : "Calculating..."}
                </div>
                <div className='w-full flex justify-between items-center border-t-2 border-[#0a66c2] p-[12px]'>
                    <span className='font-medium text-[#0a66c2] leading-7 text-lg'>Choose a voucher</span>
                    <span onClick={()=>{setShowVoucher(prev => {
                              if (prev?.some(el => el === seller?.provider?._id)) {
                                return prev?.filter(el => el !== seller?.provider?._id);
                              } else {
                                return [...prev, seller?.provider?._id];
                              }
                            });
                          }} 
                      className='cursor-pointer p-2 border border-[#868e96] rounded-full'>{!showVoucher?.some(el => el === seller?.provider?._id) ? <FaAngleDown /> : <FaAngleUp />}
                    </span>
                  </div>
                  {showVoucher?.some(el => el === seller?.provider?._id) && 
                    (
                      couponsByProvider[seller.provider._id]?.filter(canUseDiscount)?.length > 0 
                        ? 
                        <div className='flex flex-col gap-1 w-full p-[6px] bg-white h-fit max-h-[180px] overflow-y-scroll scrollbar-thin'>
                          {couponsByProvider[seller.provider._id]?.filter(canUseDiscount)?.map((el, index) => (
                          <div
                              onClick={() => handleSelectedVoucher(seller?.provider?._id, el)}
                              key={index}
                              className={clsx(
                                  "w-full flex items-center cursor-pointer",
                                  selectedVouchers[seller.provider._id]?._id === el._id ? "bg-[#D0D3DA]" : "hover:bg-[#E0E3EA]"
                              )}
                          >
                              <div className="w-[20%]">
                                  <img src={el?.image} className="w-[80px] h-[60px] object-cover rounded-sm" />
                              </div>
                              <div className="w-[80%] pl-[12px] flex flex-col justify-between text-black">
                                  <span className="text-lg line-clamp-1">{el?.name}</span>
                                  <div className="flex gap-4 items-center justify-between">
                                      <span className="text-[#15a9e8] text-sm font-medium line-clamp-1">
                                          {el?.code}
                                      </span>
                                      <span className="text-green-600 font-semibold">
                                          -{formatPrice(calculateDiscount(el, seller.products))} VNĐ
                                      </span>
                                  </div>
                              </div>
                          </div>
                        ))}
                        </div>
                      :
                        <div className='w-full p-[12px]'>
                          <span>No voucher available</span>
                        </div>
                    )
                  }
              </motion.div>
            ))}
          </div>
  
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-8"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>Total Product Price</span>
                <span>{`${formatPrice(calculateTotalProductPrice())} VND`}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Shipping Fee</span>
                <span>{`${formatPrice(calculateTotalShippingPrice())} VND`}</span>
              </div>
              <div className="flex justify-between items-center text-green-600 font-semibold">
                <span>Savings</span>
                <span>-{`${formatPrice(calculateTotalSavings())} VND`}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-indigo-600">
                  {`${formatPrice(
                    calculateTotalProductPrice() + calculateTotalShippingPrice() - calculateTotalSavings()
                  )} VND`}
                </span>
              </div>
            </div>
            <button onClick={handleCheckoutProduct} className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2">
              <FaLock />
              Proceed to Checkout
            </button>
          </motion.div>
        </div>
  
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-sm mx-4"
            >
              <h3 className="text-lg font-bold mb-4">Remove Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  )
}

export default memo(DetailCart)