"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useState, use } from "react";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function DetailQuotationPage({ params }) {
    const { referensi } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [dataQuotation, setDataQuotation] = useState([]);
    const [showReceived, setShowReceived] = useState(false);

    const fetchData = async () => {
        try {
            await apiClient.get(`/quotation/${referensi}`, { cache: 'force-cache' })
                .then((res) => {
                    console.log(res.data.data);
                    setDataQuotation(res.data.data);
                })
                .catch((err) => console.error(err));
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const getTotalKeseluruhan = () => {
        return dataQuotation.Produk.reduce((total, item) => total + (item.total_biaya || 0), 0);
    };

    const handleSendQuotation = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Quotation Sent" });
            setDataQuotation(response.data.data);
        } catch (error) {
            console.error("Error confirming RFQ:", error);
        }
    };

    const handleConfirmOrder = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Delivery" });
            setDataQuotation(response.data.data);
        } catch (error) {
            console.error("Error confirming order:", error);
        }
    };

    const handleReceiveProduct = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Received" });
            setDataQuotation(response.data.data);
            setShowReceived(true);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleValidateProduct = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Sales Order" });
            console.log(response)
            setDataQuotation(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleCancelProduct = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Cancel" });
            console.log(response)
            setDataQuotation(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleReturnProduct = async () => {
        try {
            const response = await apiClient.put(`/quotation/status/${dataQuotation.referensi}`, { status: "Return" });
            console.log(response)
            setDataQuotation(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sales Quotation</h1>
            {
                isLoading ? (
                    <CircularProgress size={26} />
                ) : (
                    <div>
                        <div className="mt-4 flex space-x-4">
                            {/* Tombol Send RFQ */}
                            {dataQuotation.status === "Quotation" && (
                                <button
                                    onClick={handleSendQuotation}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                                >
                                    Quotation Sent
                                </button>
                            )}

                            {/* Tombol Confirm Order */}
                            {dataQuotation.status === "Quotation Sent" && (
                                <button
                                    onClick={handleConfirmOrder}
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Confirm
                                </button>
                            )}

                            {/* Tombol Receive Product */}
                            {dataQuotation.status === "Delivery" && (
                                <button
                                    onClick={handleReceiveProduct}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    Receive Product
                                </button>
                            )}

                            {dataQuotation.status === "Received" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleValidateProduct}
                                        className="px-4 py-2 bg-green-500 text-white rounded"
                                    >
                                        Validate
                                    </button>
                                    <button
                                        onClick={handleCancelProduct}
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {dataQuotation.status === "Sales Order" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleReturnProduct}
                                        className="px-4 py-2 bg-gray-500 text-white rounded"
                                    >
                                        Return
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-4">
                            {/* Product Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Quotation Reference:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataQuotation.referensi}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Customer Name:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataQuotation.nama_customer}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Order Date:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataQuotation.order_date)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">status:</span>
                                    <span
                                        className={`max-w-max px-5 py-2 text-lg font-bold rounded-3xl ${{
                                            Quotation: 'text-black bg-yellow-300',
                                            'Quotation Sent': 'text-black bg-orange-300',
                                            Confirmed: 'text-black bg-cyan-300',
                                            Received: 'text-black bg-purple-300',
                                            'Sales Order': 'text-white bg-green-500',
                                            Cancel: 'text-white bg-red-500',
                                            Return: 'text-white bg-gray-500',
                                        }[dataQuotation.status] || 'text-black bg-gray-200'
                                            }`}
                                    >
                                        {dataQuotation.status}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Details</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700 border-collapse border border-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border border-gray-300">Nama</th>
                                            <th className="px-4 py-2 border border-gray-300 text-center">Quantity</th>
                                            {showReceived && <th className="px-4 py-2 border border-gray-300 text-center">Received</th>}
                                            <th className="px-4 py-2 border border-gray-300 text-center">Unit Price</th>
                                            <th className="px-4 py-2 border border-gray-300 text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            dataQuotation.Produk.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-10 py-2 border border-gray-300">{item.nama_produk}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">{item.jumlah_produk}</td>
                                                    {showReceived && (
                                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                                            {item.jumlah_produk}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.harga_produk.toLocaleString()}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.total_biaya.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        }
                                        <tr className="bg-gray-100 font-bold">
                                            <td className="px-4 py-2 border border-gray-300" colSpan={showReceived ? '4' : '3'} align="right">
                                                Total
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">Rp. {getTotalKeseluruhan().toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}