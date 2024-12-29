"use client"
import useForm from "@/app/hooks/useForm";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";

export default function ProductPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataProduct, setDataProduct] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const { formData, handleInputChange, resetForm, setFormData } = useForm({
        nama_produk: "",
        referensi: "",
        kategori: "",
        harga_produk: "",
        biaya_produksi: "",
        gambar_produk: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalDetail, setIsModalDetail] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataProduct, ['nama_produk', 'referensi', 'kategori', 'harga_produk', 'biaya_produksi']);
    const modalRef = useRef(null);
    const [error, setError] = useState(null);

    const fetchDataProduct = async () => {
        try {
            await apiClient.get('/product', { cache: 'force-cache' })
                .then((res) => {
                    setDataProduct(res.data.data);
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
        fetchDataProduct();
    }, []);

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setIsModalDetail(true);
    };

    useOutsideClick(modalRef, () => {
        resetForm();
        setIsModalOpen(false);
        setIsModalDetail(false);
        setIsEdit(false);
        setSelectedProduct(null);
    });

    const handleEdit = (product) => {
        setIsModalDetail(false);
        setIsEdit(true);
        setSelectedProduct(product)
        setFormData({
            nama_produk: product.nama_produk,
            referensi: product.referensi,
            kategori: product.kategori,
            harga_produk: product.harga_produk,
            biaya_produksi: product.biaya_produksi,
            gambar_produk: product.gambar_produk
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Buat FormData object
            const formDataObj = new FormData();
            formDataObj.append("nama_produk", formData.nama_produk);
            formDataObj.append("kategori", formData.kategori);
            formDataObj.append("harga_produk", formData.harga_produk);
            formDataObj.append("biaya_produksi", formData.biaya_produksi);
            if (formData.gambar_produk) {
                formDataObj.append("gambar_produk", formData.gambar_produk); // File
            }

            const response = await apiClient.post("/product", formDataObj, {
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
            fetchDataProduct();
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
            formDataObj.append("nama_produk", formData.nama_produk);
            formDataObj.append("kategori", formData.kategori);
            formDataObj.append("harga_produk", formData.harga_produk);
            formDataObj.append("biaya_produksi", formData.biaya_produksi);
            if (formData.gambar_produk) {
                formDataObj.append("gambar_produk", formData.gambar_produk); // File
            }

            const response = await apiClient.put(`/product/${selectedProduct.id}`, formDataObj, {
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
            fetchDataProduct();
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
                await apiClient.delete(`/product/${id}`)
                    .then((res) => {
                        fetchDataProduct();
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
            <h1 className="text-2xl font-bold">Management Product</h1>

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
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Product" autoComplete="off" />
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
                                <label htmlFor="nama_produk" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Product</label>
                                <input value={formData.nama_produk} onChange={handleInputChange} type="text" name="nama_produk" id="nama_produk" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Nama Product" required />
                                {error?.nama_produk && <p className="text-red-500 text-sm mt-1">{error?.nama_produk}</p>}
                            </div>
                            {isEdit && (
                                <div>
                                    <label htmlFor="referensi" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Referensi</label>
                                    <input readOnly value={formData.referensi} onChange={handleInputChange} type="text" name="referensi" id="referensi" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Referensi" />
                                    {error?.referensi && <p className="text-red-500 text-sm mt-1">{error?.referensi}</p>}
                                </div>
                            )}
                            <div>
                                <label htmlFor="kategori" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kategori</label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={formData.kategori || ''}
                                    onChange={handleInputChange}
                                    className={`bg-gray-50 border border-gray-300 ${error?.kategori ? 'text-red-500' : 'text-gray-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option value="Bulutangkis">Bulutangkis</option>
                                    <option value="Basket">Basket</option>
                                    <option value="Sepak Bola">Sepak Bola</option>
                                    <option value="Voly">Voly</option>
                                </select>
                                {error?.kategori && <p className="text-red-500 text-sm mt-1">{error?.kategori}</p>}
                            </div>

                            <div>
                                <label htmlFor="harga_produk" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Harga Produk</label>
                                <input value={formData.harga_produk} onChange={handleInputChange} type="number" name="harga_produk" id="harga_produk" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Harga Produk" />
                                {error?.harga_produk && <p className="text-red-500 text-sm mt-1">{error?.harga_produk}</p>}
                            </div>

                            <div>
                                <label htmlFor="biaya_produksi" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Biaya Produksi</label>
                                <input value={formData.biaya_produksi} onChange={handleInputChange} type="number" name="biaya_produksi" id="biaya_produksi" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Biaya Produksi" />
                                {error?.biaya_produksi && <p className="text-red-500 text-sm mt-1">{error?.biaya_produksi}</p>}
                            </div>
                            <div>
                                <label htmlFor="gambar_produk" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gambar Produk</label>
                                <input onChange={(e) => setFormData({ ...formData, gambar_produk: e.target.files[0] })} type="file" name="gambar_produk" id="gambar_produk" autoComplete="off" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Gambar Produk" />
                                {error?.gambar_produk && <p className="text-red-500 text-sm mt-1">{error?.gambar_produk}</p>}
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
                            {selectedProduct.nama_produk}
                        </h2>

                        {/* Product Image */}
                        <div className="mb-4">
                            <Image
                                src={`http://localhost:2000/${selectedProduct.gambar_produk}`}
                                alt={selectedProduct.nama_produk}
                                width={300}
                                height={200}
                                className="w-full h-auto object-cover rounded-lg"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="mb-4">
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Referensi:</strong> {selectedProduct.referensi || "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Kategori:</strong> {selectedProduct.kategori || "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Harga Produk:</strong>{" "}
                                {selectedProduct.harga_produk
                                    ? `Rp. ${selectedProduct.harga_produk.toLocaleString()}`
                                    : "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Biaya Produksi:</strong>{" "}
                                {selectedProduct.biaya_produksi
                                    ? `Rp. ${selectedProduct.biaya_produksi.toLocaleString()}`
                                    : "-"}
                            </p>
                            <p className="text-gray-800 dark:text-gray-200">
                                <strong>Stok:</strong> {selectedProduct.stok || 0}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                                onClick={() => handleEdit(selectedProduct)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                                onClick={() => handleDelete(selectedProduct.id)}
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
                ) : dataProduct.length > 0 ? (
                    dataProduct.map((item, index) => (
                        <div key={index} onClick={() => handleCardClick(item)} className="bg-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                            <div className="h-40 bg-gray-200 rounded-lg">
                                <Image src={`http://localhost:2000/${item.gambar_produk}`} alt={item.nama_produk} width={300} height={300} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <h3 className="mt-2 text-lg font-semibold">{item.nama_produk}</h3>
                            <p className="text-sm text-gray-600">{item.referensi}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xl font-bold text-green-500">{`Rp. ${item.harga_produk.toLocaleString()}`}</span>
                                <span className="text-sm text-gray-500">{`Stok: ${item.stok ? item.stok : 0}`}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center col-span-full" style={{ height: '200px' }}>
                        <p className="text-center text-gray-600">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );

}