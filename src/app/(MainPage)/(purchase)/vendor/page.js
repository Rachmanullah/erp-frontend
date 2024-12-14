"use client"
import useForm from "@/app/hooks/useForm";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export default function VendorPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataVendor, setDataVendor] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const { formData, handleInputChange, resetForm, setFormData, error, setError } = useForm({
        nama_vendor: "",
        type: "Individual",
        company_registrasi: "",
        alamat: "",
        no_telp: "",
        email: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataVendor, ['nama_vendor', 'type', 'company_registrasi', 'alamat', 'no_telp', 'email']);
    const modalRef = useRef(null);

    const fetchDataVendor = async () => {
        try {
            await apiClient.get('/vendor', { cache: 'force-cache' })
                .then((res) => {
                    setDataVendor(res.data.data);
                    setInitialData(res.data.data)
                })
                .catch((error) => {
                    console.error(error);
                });
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchDataVendor();
    }, []);

    useOutsideClick(modalRef, () => {
        resetForm();
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedVendor(null);
    }, []);

    const handleEdit = (vendor) => {
        setIsEdit(true);
        setSelectedVendor(vendor)
        setFormData({
            nama_vendor: vendor.nama_vendor,
            company_registrasi: vendor.company_registrasi,
            type: vendor.type,
            no_telp: vendor.no_telp,
            email: vendor.email,
            alamat: vendor.alamat
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(formData)
        try {
            const response = await apiClient.post('/vendor', formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchDataVendor();
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
            const response = await apiClient.put(`/vendor/${selectedVendor.id}`, formData);
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchDataVendor();
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

    const handleDelete = (vendorID) => {
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
                await apiClient.delete(`/vendor/${vendorID}`)
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
            <h1 className="text-2xl font-bold">Data Vendor</h1>
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
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Vendor" autoComplete="off" />
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
                            {isEdit ? 'Edit Vendor' : 'Tambah Vendor'}
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Type Vendor
                                    </label>
                                    <div className="flex space-x-4">
                                        <div className="flex items-center px-4 ps-4 border border-gray-200 rounded dark:border-gray-700">
                                            <input
                                                id="radio-individual"
                                                type="radio"
                                                name="type"
                                                value="Individual"
                                                checked={formData.type === "Individual"}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label htmlFor="radio-individual" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Individual
                                            </label>
                                        </div>
                                        <div className="flex items-center px-4 ps-4 border border-gray-200 rounded dark:border-gray-700">
                                            <input
                                                id="radio-company"
                                                type="radio"
                                                name="type"
                                                value="Company"
                                                checked={formData.type === "Company"}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label htmlFor="radio-company" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Company
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {formData.type === "Company" && (
                                    <div>
                                        <label htmlFor="company_registrasi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Company Registrasi
                                        </label>
                                        <input
                                            type="text"
                                            id="company_registrasi"
                                            name="company_registrasi"
                                            value={formData.company_registrasi}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Company Registrasi"
                                            onKeyDown={(e) => {
                                                if (!/^[0-9]*$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                                                    e.preventDefault(); // prevent non-numeric input
                                                }
                                            }}
                                        />
                                        {error?.company_registrasi && <p className="text-red-500 text-sm mt-2">{error?.company_registrasi}</p>}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="nama_vendor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Vendor</label>
                                    <input
                                        type="text"
                                        id="nama_vendor"
                                        name="nama_vendor"
                                        value={formData.nama_vendor}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Nama Vendor"
                                    />
                                    {error?.nama_vendor && <p className="text-red-500 text-sm mt-2">{error?.nama_vendor}</p>}
                                </div>
                                <div>
                                    <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
                                    <input
                                        type="text"
                                        id="alamat"
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Alamat"
                                    />
                                    {error?.alamat && <p className="text-red-500 text-sm mt-2">{error?.alamat}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Email"
                                    />
                                    {error?.email && <p className="text-red-500 text-sm mt-2">{error?.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="no_telp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">no_telp</label>
                                    <input
                                        type="telp"
                                        id="no_telp"
                                        name="no_telp"
                                        value={formData.no_telp}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Telp"
                                        autoComplete="off"
                                        onKeyDown={(e) => {
                                            if (!/^[0-9]*$/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                                                e.preventDefault(); // prevent non-numeric input
                                            }
                                        }}
                                    />
                                    {error?.no_telp && <p className="text-red-500 text-sm mt-2">{error?.no_telp}</p>}
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
                                Nama Vendor
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
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
                        ) : dataVendor.length > 0 ? (
                            dataVendor.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.nama_vendor}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
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