"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState, use } from "react";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/app/shared/routes/routes";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import useForm from "@/app/hooks/useForm";
import Swal from "sweetalert2";

export default function DetailBillPage({ params }) {
    const { referenceRfq } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const [dataDetail, setDataDetail] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const modalRef = useRef(null);
    const { formData, error, handleInputChange, resetForm, setFormData, setError } = useForm({
        payment_date: '',
        type_bill: "",
        total_pembayaran: dataDetail?.total_pembayaran,
    });

    const fetchData = async () => {
        try {
            await apiClient.get(`/bill/${referenceRfq}`, { cache: 'force-cache' })
                .then((res) => {
                    console.log(res.data.data);
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

    const handleConfirm = async () => {
        try {
            const response = await apiClient.put(`/bill/status/${dataDetail.id}`, { status: "Posted" });
            setDataDetail(response.data.data);
        } catch (error) {
            console.error("Error confirming RFQ:", error);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsLoadingButton(true);
        console.log(formData)
        try {
            await apiClient.put(`/bill/${dataDetail.id}`, formData);
            await apiClient.put(`/bill/status/${dataDetail.id}`, { status: "Paid" })
            setIsLoadingButton(false);
            fetchData();
            resetForm()
            setIsModalOpen(false);
        } catch (error) {
            setIsLoadingButton(false);
            console.log(error);
            if (error.response && error.response.data.code == 400) {
                setError(error.response.data.message);
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: error.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };



    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Bill Purchase</h1>
            {
                isLoading ? (
                    <CircularProgress size={26} />
                ) : (
                    <div>
                        <div className="mt-4 flex space-x-4">
                            {/* Tombol Create Bill */}
                            {dataDetail.status === "Draft" && (
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                                >
                                    Confirm
                                </button>
                            )}
                            {/* Tombol Payment */}
                            {dataDetail.status === "Posted" && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded"
                                >
                                    Payment
                                </button>
                            )}
                        </div>
                        {isModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="fixed inset-0 bg-black opacity-50"></div>
                                <div
                                    ref={modalRef}
                                    className="relative bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full dark:bg-gray-800 overflow-y-auto max-h-screen"
                                >
                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Payment
                                    </h3>
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label htmlFor="referensi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referensi Bill</label>
                                                <input
                                                    type="text"
                                                    id="referensi"
                                                    name="referensi"
                                                    value={dataDetail.referensi_bill}
                                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Referensi"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="referensi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referensi</label>
                                                <input
                                                    type="text"
                                                    id="referensi"
                                                    name="referensi"
                                                    value={dataDetail.referensi_rfq}
                                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Referensi"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="type_bill" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type Bill</label>
                                                <select
                                                    id="type_bill"
                                                    name="type_bill"
                                                    value={formData.type_bill || ''}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error?.type_bill ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-900'}`}
                                                >
                                                    <option value="" disabled hidden>Pilih Type</option>
                                                    <option value="Cash" >Cash</option>
                                                    <option value="Bank" >Bank</option>
                                                </select>
                                                {error?.type_bill && <p className="text-red-500 text-sm mt-2">{error?.type_bill}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline Order</label>
                                                <input
                                                    type="date"
                                                    id="payment_date"
                                                    name="payment_date"
                                                    value={formData.payment_date}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Jumlah Produk"
                                                />
                                                {error?.payment_date && <p className="text-red-500 text-sm mt-2">{error?.payment_date}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="Total" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total</label>
                                                <input
                                                    type="text"
                                                    id="Total"
                                                    name="Total"
                                                    value={dataDetail.total_pembayaran.toLocaleString()}
                                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Total"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={handlePayment}
                                                className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isLoadingButton}
                                            >
                                                {isLoadingButton ? <CircularProgress size={16} /> : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
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
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Accounting Date:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataDetail.accounting_date)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Bill Date:</span>
                                    <span className="text-lg font-bold text-gray-800">{formatTanggal(dataDetail.bill_date)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">status:</span>
                                    <span className="text-lg font-bold text-gray-800">{dataDetail.status}</span>
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
    )
}