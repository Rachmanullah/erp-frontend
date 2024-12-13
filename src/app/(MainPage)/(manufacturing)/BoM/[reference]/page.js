"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState, use } from "react";
import Swal from "sweetalert2";

export default function DetailBoMPage({ params }) {
    const { reference } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [dataBom, setDataBom] = useState([]);

    const fetchData = async () => {
        try {
            await apiClient.get(`/bom/reference/${reference}`, { cache: 'force-cache' })
                .then((res) => {
                    console.log(res.data.data);
                    setDataBom(res.data.data);
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

    const calculateTotalBoMCost = (bahan) => {
        if (!bahan || !Array.isArray(bahan)) return 0; // Handle null or invalid data
        return bahan.reduce((total, item) => total + (item.total_biaya_bahan || 0), 0);
    };


    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Bill Of Materials</h1>
            {
                isLoading ? (
                    <CircularProgress size={26} />
                ) : (
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-600">Product Name:</span>
                                <span className="text-lg font-bold text-gray-800">{dataBom.nama_produk}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-600">BoM Reference:</span>
                                <span className="text-lg font-bold text-gray-800">{dataBom.referensi_bom}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-600">Total Product Cost:</span>
                                <span className="text-lg font-bold text-gray-800">Rp. {dataBom.total_biaya_produk.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-600">Quantity:</span>
                                <span className="text-lg font-bold text-gray-800">{dataBom.jumlah_produk}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bahan Details</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700 border-collapse border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 border border-gray-300">Product</th>
                                        <th className="px-4 py-2 border border-gray-300 text-center">Quantity</th>
                                        <th className="px-4 py-2 border border-gray-300 text-center">BoM Cost</th>
                                        <th className="px-4 py-2 border border-gray-300 text-center">Product Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-2 border border-gray-300">[{dataBom.referensi_produk}] {dataBom.nama_produk}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">{dataBom.jumlah_produk}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">Rp. {calculateTotalBoMCost(dataBom.bahan).toLocaleString()}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">Rp. {dataBom.biaya_produksi.toLocaleString()}</td>
                                    </tr>
                                    {
                                        dataBom.bahan.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-10 py-2 border border-gray-300">{item.nama_bahan}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-center">{item.jumlah_bahan}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.total_biaya_bahan.toLocaleString()}</td>
                                                <td className="px-4 py-2 border border-gray-300 text-center">Rp. {item.total_biaya_bahan.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    }
                                    <tr className="bg-gray-100 font-bold">
                                        <td className="px-4 py-2 border border-gray-300" colSpan="2" align="right">
                                            Unit Cost
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">Rp. {calculateTotalBoMCost(dataBom.bahan).toLocaleString()}</td>
                                        <td className="px-4 py-2 border border-gray-300 text-center">Rp. {dataBom.biaya_produksi.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div>
    );
}