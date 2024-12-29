"use client"
import useForm from "@/app/hooks/useForm";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";

export default function BahanPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataBahan, setDataBahan] = useState([]);
    const [selectedBahan, setSelectedBahan] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const { formData, handleInputChange, resetForm, setFormData } = useForm({
        nama_bahan: "",
        biaya_bahan: "",
        harga_bahan: "",
        gambar_bahan: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalDetail, setIsModalDetail] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataBahan, ['nama_bahan', 'biaya_bahan', 'harga_bahan', 'gambar_bahan']);
    const modalRef = useRef(null);
    const [error, setError] = useState(null);

    const fetchDataBahan = async () => {
        try {
            await apiClient.get('/bahan', { cache: 'force-cache' })
                .then((res) => {
                    setDataBahan(res.data.data);
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
        fetchDataBahan();
    }, []);

    const handleCardClick = (bahan) => {
        setSelectedBahan(bahan);
        setIsModalDetail(true);
    };

    useOutsideClick(modalRef, () => {
        resetForm();
        setIsModalOpen(false);
        setIsModalDetail(false);
        setIsEdit(false);
        setSelectedBahan(null);
    });

    const handleEdit = (bahan) => {
        setIsModalDetail(false);
        setIsEdit(true);
        setSelectedBahan(bahan)
        setFormData({
            nama_bahan: bahan.nama_bahan,
            harga_bahan: bahan.harga_bahan,
            biaya_bahan: bahan.biaya_bahan,
            gambar_bahan: bahan.gambar_bahan
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Buat FormData object
            const formDataObj = new FormData();
            formDataObj.append("nama_bahan", formData.nama_bahan);
            formDataObj.append("harga_bahan", formData.harga_bahan);
            formDataObj.append("biaya_bahan", formData.biaya_bahan);
            if (formData.gambar_bahan) {
                formDataObj.append("gambar_bahan", formData.gambar_bahan); // File
            }

            const response = await apiClient.post("/bahan", formDataObj, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setIsLoading(false);
            Swal.fire({
                title: "Success!",
                text: response.data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1000,
            });
            fetchDataBahan();
            resetForm();
            setIsModalOpen(false); // Close modal after submission
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            if (error.response && error.response.data.code === 400) {
                setError(error.response.data.message);
            } else {
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Unexpected Error",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append("nama_bahan", formData.nama_bahan);
            formDataObj.append("harga_bahan", formData.harga_bahan);
            formDataObj.append("biaya_bahan", formData.biaya_bahan);
            if (formData.gambar_bahan) {
                formDataObj.append("gambar_bahan", formData.gambar_bahan); // File
            }

            const response = await apiClient.put(`/bahan/${selectedBahan.id}`, formDataObj, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setIsLoading(false);
            Swal.fire({
                title: 'Success!',
                text: response.data.message,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            fetchDataBahan();
            resetForm();
            setIsEdit(false);
            setIsModalOpen(false); // Close modal after update
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
    };

    const handleDelete = (id) => {
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
                await apiClient.delete(`/bahan/${id}`)
                    .then((res) => {
                        fetchDataBahan();
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
            <h1 className="text-2xl font-bold">Management Bahan</h1>

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
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Bahan" autoComplete="off" />
                    </div>
                </form>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div ref={modalRef} className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full dark:bg-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {isEdit ? 'Edit Product' : 'Tambah Product'}
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="nama_bahan" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Bahan</label>
                                <input value={formData.nama_bahan} onChange={handleInputChange} type="text" name="nama_bahan" id="nama_bahan" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Nama Bahan" required />
                                {error?.nama_bahan && <p className="text-red-500 text-sm mt-1">{error?.nama_bahan}</p>}
                            </div>
                            <div>
                                <label htmlFor="harga_bahan" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Harga Bahan</label>
                                <input value={formData.harga_bahan} onChange={handleInputChange} type="number" name="harga_bahan" id="harga_bahan" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Harga Bahan" />
                                {error?.harga_bahan && <p className="text-red-500 text-sm mt-1">{error?.harga_bahan}</p>}
                            </div>

                            <div>
                                <label htmlFor="biaya_bahan" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Biaya Bahan</label>
                                <input value={formData.biaya_bahan} onChange={handleInputChange} type="number" name="biaya_bahan" id="biaya_bahan" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Biaya Bahan" />
                                {error?.biaya_bahan && <p className="text-red-500 text-sm mt-1">{error?.biaya_bahan}</p>}
                            </div>
                            <div>
                                <label htmlFor="gambar_bahan" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gambar Produk</label>
                                <input onChange={(e) => setFormData({ ...formData, gambar_bahan: e.target.files[0] })} type="file" name="gambar_bahan" id="gambar_bahan" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Gambar Bahan" />
                                {error?.gambar_bahan && <p className="text-red-500 text-sm mt-1">{error?.gambar_bahan}</p>}
                            </div>

                            <button onClick={isEdit ? handleUpdate : handleSubmit} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                {isLoading ? <CircularProgress /> : isEdit ? 'Update' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isModalDetail && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-black opacity-50"></div>

                    {/* Modal Content */}
                    <div
                        ref={modalRef}
                        className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full dark:bg-gray-700"
                    >
                        {/* Product Title */}
                        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
                            {selectedBahan.nama_bahan}
                        </h2>

                        {/* Product Image */}
                        <div className="mb-4">
                            <Image
                                src={`http://localhost:2000/${selectedBahan.gambar_bahan}`}
                                alt={selectedBahan.nama_bahan}
                                width={300}
                                height={200}
                                className="w-full h-auto object-cover rounded-lg"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="mb-4">
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Harga Bahan:</strong>{" "}
                                {selectedBahan.harga_bahan
                                    ? `Rp. ${selectedBahan.harga_bahan.toLocaleString()}`
                                    : "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Biaya Bahan:</strong>{" "}
                                {selectedBahan.biaya_bahan
                                    ? `Rp. ${selectedBahan.biaya_bahan.toLocaleString()}`
                                    : "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Stok:</strong> {selectedBahan.stok || 0}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                                onClick={() => handleEdit(selectedBahan)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                                onClick={() => handleDelete(selectedBahan.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="flex justify-center items-center col-span-full" style={{ height: '200px' }}>
                        <CircularProgress size={26} />
                    </div>
                ) : dataBahan.length > 0 ? (
                    dataBahan.map((item, index) => (
                        <div key={index} onClick={() => handleCardClick(item)} className="bg-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                            <div className="h-40 bg-gray-200 rounded-lg">
                                <Image src={`http://localhost:2000/${item.gambar_bahan}`} alt={item.nama_bahan} width={300} height={300} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <h3 className="mt-2 text-lg font-semibold">{item.nama_bahan}</h3>
                            {/* <p className="text-sm text-gray-600">{item.referensi}</p> */}
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xl font-bold text-green-500">{`Rp. ${item.harga_bahan.toLocaleString()}`}</span>
                                <span className="text-sm text-gray-500">{`Stok: ${item.stok ? item.stok : 0}`}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center col-span-full" style={{ height: '200px' }}>
                        <p className="text-center text-gray-600">No materials found</p>
                    </div>
                )}
            </div>
        </div>
    );
}