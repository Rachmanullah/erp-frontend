"use client"

import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";
import useForm from "@/app/hooks/useForm";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function BoMPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataOrder, setDataOrder] = useState([]);
    const [dataBom, setDataBom] = useState([]);
    const [dataProduct, setDataProduct] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialData, setInitialData] = useState([]);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataOrder, ['Produk.nama_produk', 'referensi', 'status', 'jumlah_order']);
    const modalRef = useRef(null);
    const [error, setError] = useState(null);
    const { formData, handleInputChange, resetForm, setFormData } = useForm({
        id_produk: 0,
        referensi_bom: "",
        jumlah_order: 0,
    });

    useOutsideClick(modalRef, () => {
        resetForm();
        setIsModalOpen(false);
        setIsEdit(false);
    }, []);

    const fetchData = async () => {
        try {
            const [responseBom, responseProduct, responseOrder] = await Promise.all([
                apiClient.get('/bom', { cache: 'force-cache' }),
                apiClient.get('/product', { cache: 'force-cache' }),
                apiClient.get('/order', { cache: 'force-cache' }),
            ]);
            setDataOrder(responseOrder.data.data);
            setInitialData(responseOrder.data.data);
            setDataProduct(responseProduct.data.data);
            setDataBom(responseBom.data.data);

            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (item) => {
        setSelectedOrder(item);
        setFormData({
            id_produk: item.id_produk,
            referensi_bom: item.referensi_bom,
            jumlah_order: item.jumlah_order,
        });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(formData)
        try {
            const response = await apiClient.post('/order', formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchData();
            resetForm();
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
        try {
            const response = await apiClient.put(`/order/${selectedOrder.id}`, formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchData();
            resetForm();
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

    const handleDelete = (orderID) => {
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
                await apiClient.delete(`/order/${orderID}`)
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
        <div className="p-4">
            <h1 className="text-2xl font-bold">Data Order</h1>
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
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Order" autoComplete="off" />
                    </div>
                </form>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div
                        ref={modalRef}
                        className="relative bg-white rounded-lg shadow-lg p-8 max-w-lg w-full dark:bg-gray-800 overflow-y-auto max-h-screen"
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            {isEdit ? 'Edit Order' : 'Tambah Order'}
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="id_produk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                                    <select
                                        id="id_produk"
                                        name="id_produk"
                                        value={formData.id_produk || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error?.id_produk ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="" disabled hidden>Pilih Produk</option>
                                        {dataProduct.map((item) => (
                                            <option key={item.id} value={item.id}>{item.nama_produk}</option>
                                        ))}
                                    </select>
                                    {error?.id_produk && <p className="text-red-500 text-sm mt-2">{error?.id_produk}</p>}
                                </div>
                                <div>
                                    <label htmlFor="referensi_bom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">BoM</label>
                                    <select
                                        id="referensi_bom"
                                        name="referensi_bom"
                                        value={formData.referensi_bom || ''}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error?.referensi_bom ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-900'}`}
                                    >
                                        <option value="" disabled hidden>Pilih BoM</option>
                                        {dataBom.map((item, index) => (
                                            <option key={index} value={item.referensi_bom}>[{item.referensi_bom}] {item.nama_produk}</option>
                                        ))}
                                    </select>
                                    {error?.referensi_bom && <p className="text-red-500 text-sm mt-2">{error?.referensi_bom}</p>}
                                </div>
                                <div>
                                    <label htmlFor="jumlah_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Order</label>
                                    <input
                                        type="number"
                                        id="jumlah_order"
                                        name="jumlah_order"
                                        value={formData.jumlah_order}
                                        min={0}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Jumlah Order"
                                    />
                                    {error?.jumlah_order && <p className="text-red-500 text-sm mt-2">{error?.jumlah_order}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bahan yang Dibutuhkan</label>
                                    <div className="overflow-x-auto mt-2">
                                        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                            <thead className="bg-gray-200 dark:bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2">#</th>
                                                    <th scope="col" className="px-4 py-2">Nama Bahan</th>
                                                    <th scope="col" className="px-4 py-2">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataBom.find(bom => bom.referensi_bom === formData.referensi_bom)?.bahan.map((bahan, index) => (
                                                    <tr key={bahan.id_bahan} className="border-b border-gray-300 dark:border-gray-600">
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">{bahan.nama_bahan}</td>
                                                        <td className="px-4 py-2">{bahan.jumlah_bahan * formData.jumlah_order}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Product
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Quantity
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
                                <td colSpan="7" className="py-4">
                                    <CircularProgress size={26} />
                                </td>
                            </tr>
                        ) : dataOrder.length > 0 ? (
                            // Filter data untuk memastikan hanya satu referensi yang muncul 
                            dataOrder.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.referensi}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.created_at ? formatTanggal(item.created_at) : ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.Product.nama_produk}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.jumlah_order}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-5 py-2 text-md font-bold rounded-3xl  ${item.status === 'Draft' ? 'text-black bg-yellow-300' : item.status === 'Confirmed' ? 'text-black bg-cyan-300' : item.status === 'Production' ? 'text-black bg-blue-300' : item.status === 'Done' ? 'text-white bg-green-500' : ''}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Edit</button>
                                            <Link href={ROUTES.detailOrder(item.id)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detail</Link>
                                            <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan="7" className="px-6 py-4 text-center">
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