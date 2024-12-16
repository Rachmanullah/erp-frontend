"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState, use } from "react";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function DetailRfqPage({ params }) {
    const { reference } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [dataRfq, setDataRfq] = useState([]);
    const [showReceived, setShowReceived] = useState(false);

    const fetchData = async () => {
        try {
            await apiClient.get(`/rfq/${reference}`, { cache: 'force-cache' })
                .then((res) => {
                    console.log(res.data.data);
                    setDataRfq(res.data.data);
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
        return dataRfq.Bahan.reduce((total, item) => total + (item.total_biaya || 0), 0);
    };

    const handleSendRfq = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Send RFQ" });
            setDataRfq(response.data.data);
        } catch (error) {
            console.error("Error confirming RFQ:", error);
        }
    };

    const handleConfirmOrder = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Confirmed" });
            setDataRfq(response.data.data);
        } catch (error) {
            console.error("Error confirming order:", error);
        }
    };

    const handleReceiveProduct = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Received" });
            setDataRfq(response.data.data);
            setShowReceived(true);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleValidateProduct = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Purchase Order" });
            console.log(response)
            setDataRfq(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleCancelProduct = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Cancel" });
            console.log(response)
            setDataRfq(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    const handleReturnProduct = async () => {
        try {
            const response = await apiClient.put(`/rfq/status/${dataRfq.referensi}`, { status: "Return" });
            console.log(response)
            setDataRfq(response.data.data);
        } catch (error) {
            console.error("Error receiving product:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Request For Quotation</h1>
            {
                isLoading ? (
                    <CircularProgress size={26} />
                ) : (
                    <div>
                        <div className="mt-4 flex space-x-4">
                            {/* Tombol Send RFQ */}
                            {dataRfq.status === "RFQ" && (
                                <button
                                    onClick={handleSendRfq}
                                    className="px-4 py-2 shadow-lg shadow-black bg-yellow-500 text-white rounded"
                                >
                                    Send RFQ
                                </button>
                            )}

                            {/* Tombol Confirm Order */}
                            {dataRfq.status === "Send RFQ" && (
                                <button
                                    onClick={handleConfirmOrder}
                                    className="px-4 py-2 shadow-lg shadow-black bg-blue-500 text-white rounded"
                                >
                                    Confirm Order
                                </button>
                            )}

                            {/* Tombol Receive Product */}
                            {dataRfq.status === "Confirmed" && (
                                <button
                                    onClick={handleReceiveProduct}
                                    className="px-4 py-2 shadow-lg shadow-black bg-green-500 text-white rounded"
                                >
                                    Receive Product
                                </button>
                            )}

                            {dataRfq.status === "Received" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleValidateProduct}
                                        className="px-4 py-2 shadow-lg shadow-black bg-green-500 text-white rounded"
                                    >
                                        Validate
                                    </button>
                                    <button
                                        onClick={handleCancelProduct}
                                        className="px-4 py-2 shadow-lg shadow-black bg-red-500 text-white rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {dataRfq.status === "Purchase Order" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleReturnProduct}
                                        className="px-4 py-2 shadow-lg shadow-black bg-gray-500 text-white rounded"
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
                                    <span className="font-medium text-gray-600">RFQ Reference:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataRfq.referensi}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Vendor Name:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataRfq.nama_vendor}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Deadline Order:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataRfq.deadline_order)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">status:</span>
                                    <span
                                        className={`max-w-max px-5 py-2 text-lg font-bold rounded-3xl ${{
                                            RFQ: 'text-black bg-yellow-300',
                                            'Send RFQ': 'text-black bg-orange-300',
                                            Confirmed: 'text-black bg-cyan-300',
                                            Received: 'text-black bg-purple-300',
                                            'Purchase Order': 'text-white bg-green-500',
                                            Cancel: 'text-white bg-red-500',
                                            Return: 'text-white bg-gray-500',
                                        }[dataRfq.status] || 'text-black bg-gray-200'
                                            }`}
                                    >
                                        {dataRfq.status}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bahan Details</h2>
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
                                            dataRfq.Bahan.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-10 py-2 border border-gray-300">{item.nama_bahan}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">{item.jumlah_bahan}</td>
                                                    {showReceived && (
                                                        <td className="px-4 py-2 border border-gray-300 text-center">
                                                            {item.jumlah_bahan}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.biaya_bahan.toLocaleString()}</td>
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