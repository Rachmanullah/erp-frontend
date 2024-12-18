"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState, use } from "react";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/app/shared/routes/routes";

export default function DetailPurchaseOrderPage({ params }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [dataDetail, setDataDetail] = useState([]);
    const router = useRouter();

    const fetchData = async () => {
        try {
            await apiClient.get(`/purchaseOrder/${id}`, { cache: 'force-cache' })
                .then((res) => {
                    setDataDetail(res.data.data);
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
        return dataDetail.Bahan.reduce((total, item) => total + (item.total_biaya || 0), 0);
    };

    const handleCreateBill = async () => {
        try {
            router.push(ROUTES.detailBill(dataDetail.referensi_rfq));
        } catch (error) {
            console.error("Error confirming RFQ:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Purchase Order</h1>
            {
                isLoading ? (
                    <CircularProgress size={26} />
                ) : (
                    <div>
                        <div className="mt-4 flex space-x-4">
                            {/* Tombol Create Bill */}
                            {dataDetail.status === "Waiting Bill" && (
                                <button
                                    onClick={handleCreateBill}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                                >
                                    Create Bill
                                </button>
                            )}
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-4">
                            {/* Product Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">RFQ Reference:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataDetail.referensi_rfq}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Vendor Name:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataDetail.nama_vendor}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Confirmed Order:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataDetail.confirmation_date)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Arrival Date:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataDetail.arrival_date)}</span>
                                </div>
                                {
                                    dataDetail.referensi_bill?.bill_date && (
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-600">Bill Date:</span>
                                            <span className="text-lg font-bold text-gray-800">{formatTanggal(dataDetail.referensi_bill?.bill_date)}</span>
                                        </div>
                                    )
                                }
                                {dataDetail.status === "Fully Billed" && (
                                    <>
                                        {dataDetail.referensi_bill?.payment_date && (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-600">Payment Date:</span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {formatTanggal(dataDetail.referensi_bill?.payment_date)}
                                                </span>
                                            </div>
                                        )}
                                        {dataDetail.referensi_bill?.status && (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-600">Status Bill:</span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    <span
                                                        className={`max-w-max px-5 py-2 text-lg font-bold rounded-3xl ${{
                                                            'Draft': 'text-black bg-gray-500',
                                                            'Posted': 'text-white bg-cyan-500',
                                                            'Paid': 'text-white bg-green-500',
                                                            'Not Paid': 'text-white bg-red-500',
                                                        }[dataDetail.referensi_bill?.status] || 'text-black bg-gray-200'
                                                            }`}
                                                    >
                                                        {dataDetail.referensi_bill?.status}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">status:</span>
                                    <span
                                        className={`max-w-max px-5 py-2 text-lg font-bold rounded-3xl ${{
                                            'Nothing to Bill': 'text-black bg-gray-500',
                                            'Waiting Bill': 'text-white bg-cyan-500',
                                            'Fully Billed': 'text-white bg-green-500',
                                        }[dataDetail.status] || 'text-black bg-gray-200'
                                            }`}
                                    >
                                        {dataDetail.status}
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
                                            <th className="px-4 py-2 border border-gray-300 text-center">Received</th>
                                            <th className="px-4 py-2 border border-gray-300 text-center">Unit Price</th>
                                            <th className="px-4 py-2 border border-gray-300 text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            dataDetail.Bahan.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-10 py-2 border border-gray-300">{item.nama_bahan}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">{item.jumlah_bahan}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">{item.jumlah_bahan}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.biaya_bahan.toLocaleString()}</td>
                                                    <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.total_biaya.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        }
                                        <tr className="bg-gray-100 font-bold">
                                            <td className="px-4 py-2 border border-gray-300" colSpan='4' align="right">
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