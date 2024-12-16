"use client"
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";
import { useRfqForm } from "@/app/hooks/useRfqForm";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function RfqPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataRfq, setDataRfq] = useState([]);
    const [dataVendor, setDataVendor] = useState([]);
    const [dataBahan, setDataBahan] = useState([]);
    const [initialData, setInitialData] = useState([]);
    const { formData, error, setError, handleInputChange, handleAddBahan, handleRfqChange, handleRemoveBahan, setFormData, setbahan } = useRfqForm({
        id_vendor: 0,
        referensi: "",
        deadline_order: "",
        bahan: [{
            id_bahan: 0,
            jumlah_bahan: 0,
            biaya_bahan: 0,
            total_biaya: 0,
        }]
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataRfq, ['nama_vendor', 'referensi', 'deadline_order']);
    const modalRef = useRef(null);

    const fetchData = async () => {
        try {
            const [responseRfq, responseVendor, responseMaterial] = await Promise.all([
                apiClient.get('/rfq', { cache: 'force-cache' }),
                apiClient.get('/vendor', { cache: 'force-cache' }),
                apiClient.get('/bahan', { cache: 'force-cache' }),
            ]);

            setDataRfq(responseRfq.data.data);
            setInitialData(responseRfq.data.data);
            setDataBahan(responseMaterial.data.data);
            setbahan(responseMaterial.data.data);
            setDataVendor(responseVendor.data.data);

            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    useOutsideClick(modalRef, () => {
        setFormData({
            id_vendor: 0,
            referensi: "",
            deadline_order: "",
            bahan: [{
                id_bahan: 0,
                jumlah_bahan: 0,
                biaya_bahan: 0,
                total_biaya: 0,
            }]
        });
        setIsModalOpen(false);
        setIsEdit(false);
    });

    const getTotalKeseluruhan = () => {
        return formData.bahan.reduce((total, item) => total + (item.total_biaya || 0), 0);
    };

    const handleEdit = (item) => {
        setFormData({
            id_vendor: item.id_vendor,
            referensi: item.referensi,
            deadline_order: item.deadline_order.split('T')[0],
            bahan: item.bahan.map(b => ({
                id_bahan: b.id_bahan,
                jumlah_bahan: b.jumlah_bahan,
                biaya_bahan: b.biaya_bahan,
                total_biaya: b.total_biaya,
            }))
        });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiClient.post('/rfq', formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchData();
            setFormData({
                id_produk: 0,
                referensi: "",
                jumlah_produk: 0,
                bahan: [{
                    id_bahan: 0,
                    jumlah_bahan: 0,
                    biaya_bahan: 0,
                    total_biaya: 0,
                }]
            });
            setError(null)
            setIsModalOpen(false); // Close modal after submission
        } catch (error) {
            setIsLoading(false);
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
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(formData)
        try {
            const response = await apiClient.put(`/rfq/${formData.referensi}`, formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchData();
            setFormData({
                id_vendor: 0,
                referensi: "",
                deadline_order: "",
                bahan: [{
                    id_bahan: 0,
                    jumlah_bahan: 0,
                    biaya_bahan: 0,
                    total_biaya: 0,
                }]
            });
            setError(null)
            setIsEdit(false)
            setIsModalOpen(false); // Close modal after submission
        } catch (error) {
            setIsLoading(false);
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
    }

    const handleDelete = (reference) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await apiClient.delete(`/rfq/${reference}`)
                    .then((res) => {
                        fetchData();
                        Swal.fire({
                            title: "Deleted!",
                            text: 'Data Berhasil Dihapus',
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1000
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        Swal.fire({
                            title: 'Error!',
                            text: err.response.data.message,
                            icon: 'error',
                        });
                    })
            }
        });
    }

    return (
        <div className="p-4" >
            <h1 className="text-2xl font-bold">Request For Quotation</h1>

            <div className="flex justify-between relative items-center">
                <button onClick={() => setIsModalOpen(true)} className="relative inline-flex items-center justify-center p-0.5 mb-5 me-2 mt-5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Tambah
                    </span>
                </button>
                <form>
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search RFQ" autoComplete="off" />
                    </div>
                </form>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div
                        ref={modalRef}
                        className="relative bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full dark:bg-gray-800 overflow-y-auto max-h-screen"
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            {isEdit ? 'Edit RFQ' : 'Tambah RFQ'}
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="id_vendor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
                                    <select
                                        id="id_vendor"
                                        name="id_vendor"
                                        value={formData.id_vendor || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error?.id_vendor ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="" disabled hidden>Pilih Vendor</option>
                                        {dataVendor.map((item) => (
                                            <option key={item.id} value={item.id}>{item.nama_vendor}</option>
                                        ))}
                                    </select>
                                    {error?.id_vendor && <p className="text-red-500 text-sm mt-2">{error?.id_vendor}</p>}
                                </div>
                                {
                                    isEdit && (
                                        <div>
                                            <label htmlFor="referensi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referensi</label>
                                            <input
                                                type="text"
                                                id="referensi"
                                                name="referensi"
                                                value={formData.referensi}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Referensi"
                                                readOnly
                                            />
                                            {error?.referensi && <p className="text-red-500 text-sm mt-2">{error?.referensi}</p>}
                                        </div>
                                    )
                                }
                                <div>
                                    <label htmlFor="deadline_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline Order</label>
                                    <input
                                        type="date"
                                        id="deadline_order"
                                        name="deadline_order"
                                        value={formData.deadline_order}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Jumlah Produk"
                                    />
                                    {error?.deadline_order && <p className="text-red-500 text-sm mt-2">{error?.deadline_order}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.bahan.map((material, index) => (
                                    <div key={index} className="grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-2">
                                            <label htmlFor={`id_bahan_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bahan</label>
                                            <select
                                                id={`id_bahan_${index}`}
                                                name="id_bahan"
                                                value={material.id_bahan || ''}
                                                onChange={(e) => handleRfqChange(index, e)}
                                                className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="" disabled hidden>Pilih Bahan</option>
                                                {dataBahan.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.nama_bahan}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor={`jumlah_bahan_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah</label>
                                            <input
                                                type="number"
                                                id={`jumlah_bahan_${index}`}
                                                name="jumlah_bahan"
                                                value={material.jumlah_bahan}
                                                onChange={(e) => handleRfqChange(index, e)}
                                                className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Biaya Bahan
                                            </label>
                                            <input
                                                type="number"
                                                name="biaya_bahan"
                                                value={material.biaya_bahan || 0}
                                                disabled
                                                className="w-full mt-1 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Total Biaya
                                            </label>
                                            <input
                                                type="number"
                                                name="total_biaya"
                                                value={material.total_biaya || 0}
                                                disabled
                                                className="w-full mt-1 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBahan(index)}
                                            className="mt-6 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* Total Keseluruhan Biaya */}
                            <div className="mt-6 text-right">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Total Keseluruhan Biaya: {getTotalKeseluruhan()}
                                </h3>
                            </div>
                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={handleAddBahan}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Tambah Bahan
                                </button>
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
                                    onClick={isEdit ? handleUpdate : handleSubmit}
                                    className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress size={16} /> : isEdit ? 'Update' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                no
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Reference
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Vendor
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Deadline Order
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr className="text-center">
                                <td colSpan="5" className="py-4">
                                    <CircularProgress size={26} />
                                </td>
                            </tr>
                        ) : dataRfq.length > 0 ? (
                            // Filter data untuk memastikan hanya satu referensi yang muncul 
                            dataRfq.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.referensi}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.nama_vendor}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.deadline_order)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-5 py-2 text-md font-bold rounded-3xl ${{
                                                RFQ: 'text-black bg-yellow-300',
                                                'Send RFQ': 'text-black bg-orange-300',
                                                Confirmed: 'text-black bg-cyan-300',
                                                Received: 'text-black bg-purple-300',
                                                'Purchase Order': 'text-white bg-green-500',
                                                Cancel: 'text-white bg-red-500',
                                                Return: 'text-white bg-gray-500',
                                            }[item.status] || 'text-black bg-gray-200'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Edit</button>
                                            <Link href={ROUTES.detailRfq(item.referensi)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detail</Link>
                                            <button onClick={() => handleDelete(item.referensi)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <p>Data Tidak Tersedia</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}