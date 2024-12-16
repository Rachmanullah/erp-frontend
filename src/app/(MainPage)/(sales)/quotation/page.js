"use client"
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";
import { useQuotationForm } from "@/app/hooks/useQuotationForm";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function RfqPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataQuotation, setDataQuotation] = useState([]);
    const [dataCustomer, setDataCustomer] = useState([]);
    const [dataProduk, setDataProduk] = useState([]);
    const [initialData, setInitialData] = useState([]);
    const { formData, error, setError, handleInputChange, handleAddProduk, handleQuotationChange, handleRemoveProduk, setFormData, setproduk } = useQuotationForm({
        id_customer: 0,
        referensi: "",
        order_date: "",
        produk: [{
            id_produk: 0,
            jumlah_produk: 0,
            harga_produk: 0,
            total_biaya: 0,
        }]
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataQuotation, ['nama_customer', 'referensi', 'order_date']);
    const modalRef = useRef(null);

    const fetchData = async () => {
        try {
            const [responseQuotation, responseCustomer, responseProduk] = await Promise.all([
                apiClient.get('/quotation', { cache: 'force-cache' }),
                apiClient.get('/customer', { cache: 'force-cache' }),
                apiClient.get('/product', { cache: 'force-cache' }),
            ]);

            setDataQuotation(responseQuotation.data.data);
            console.log(responseQuotation.data.data)
            setInitialData(responseQuotation.data.data);
            setDataProduk(responseProduk.data.data);
            setproduk(responseProduk.data.data);
            setDataCustomer(responseCustomer.data.data);

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
            id_customer: 0,
            referensi: "",
            order_date: "",
            produk: [{
                id_produk: 0,
                jumlah_produk: 0,
                harga_produk: 0,
                total_biaya: 0,
            }]
        });
        setIsModalOpen(false);
        setIsEdit(false);
    });

    const getTotalKeseluruhan = () => {
        return formData.produk.reduce((total, item) => total + (item.total_biaya || 0), 0);
    };

    const handleEdit = (item) => {
        setFormData({
            id_customer: item.id_customer,
            referensi: item.referensi,
            order_date: item.order_date.split('T')[0],
            produk: item.produk.map(b => ({
                id_produk: b.id_produk,
                jumlah_produk: b.jumlah_produk,
                harga_produk: b.harga_produk,
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
            const response = await apiClient.post('/quotation', formData);
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
                id_customer: 0,
                referensi: "",
                order_date: "",
                produk: [{
                    id_produk: 0,
                    jumlah_produk: 0,
                    harga_produk: 0,
                    total_biaya: 0,
                }]
            });
            setError(null)
            setIsModalOpen(false);
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
            const response = await apiClient.put(`/quotation/${formData.referensi}`, formData);
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
                id_customer: 0,
                referensi: "",
                order_date: "",
                produk: [{
                    id_produk: 0,
                    jumlah_produk: 0,
                    harga_produk: 0,
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
                await apiClient.delete(`/quotation/${reference}`)
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
            <h1 className="text-2xl font-bold">Sales Quotation</h1>

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
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Quotation" autoComplete="off" />
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
                            {isEdit ? 'Edit Quotation' : 'Tambah Quotation'}
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="id_customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                                    <select
                                        id="id_customer"
                                        name="id_customer"
                                        value={formData.id_customer || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error?.id_customer ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="" disabled hidden>Pilih Customer</option>
                                        {dataCustomer.map((item) => (
                                            <option key={item.id} value={item.id}>{item.nama_customer}</option>
                                        ))}
                                    </select>
                                    {error?.id_customer && <p className="text-red-500 text-sm mt-2">{error?.id_customer}</p>}
                                </div>
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
                                    />
                                    {error?.referensi && <p className="text-red-500 text-sm mt-2">{error?.referensi}</p>}
                                </div>
                                <div>
                                    <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Date</label>
                                    <input
                                        type="date"
                                        id="order_date"
                                        name="order_date"
                                        value={formData.order_date}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="order_Date"
                                    />
                                    {error?.order_date && <p className="text-red-500 text-sm mt-2">{error?.order_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.produk.map((material, index) => (
                                    <div key={index} className="grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-2">
                                            <label htmlFor={`id_produk_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Produk</label>
                                            <select
                                                id={`id_produk_${index}`}
                                                name="id_produk"
                                                value={material.id_produk || ''}
                                                onChange={(e) => handleQuotationChange(index, e)}
                                                className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="" disabled hidden>Pilih Produk</option>
                                                {dataProduk.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.nama_produk}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor={`jumlah_produk_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah</label>
                                            <input
                                                type="number"
                                                id={`jumlah_produk_${index}`}
                                                name="jumlah_produk"
                                                value={material.jumlah_produk}
                                                onChange={(e) => handleQuotationChange(index, e)}
                                                className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Harga Produk
                                            </label>
                                            <input
                                                type="number"
                                                name="harga_produk"
                                                value={material.harga_produk || 0}
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
                                            onClick={() => handleRemoveProduk(index)}
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
                                    onClick={handleAddProduk}
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
                                Customer
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Order Date
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
                        ) : dataQuotation.length > 0 ? (
                            // Filter data untuk memastikan hanya satu referensi yang muncul 
                            dataQuotation.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.referensi}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.nama_customer}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.order_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Edit</button>
                                            <Link href={ROUTES.detailQuotation(item.referensi)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detail</Link>
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