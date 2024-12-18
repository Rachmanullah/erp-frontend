"use client";

import apiClient from "@/app/lib/apiClient";
import { CircularProgress } from "@/app/shared/components";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [countProduct, setCountProduct] = useState(0);
    const [countQuotation, setCountQuotation] = useState(0);
    const [totalInvoice, setTotalInvoice] = useState(0);
    const [topInvoice, setTopInvoice] = useState([]);
    const [topProduct, setTopProduct] = useState(null);

    const fetchData = async () => {
        try {
            const [resCountProduct, resCountQuotation, resTotalInvoice, resTopInvoice, resTopProduct] = await Promise.all([
                apiClient.get("/count/produk", { cache: "force-cache" }),
                apiClient.get("/count/quotation", { cache: "force-cache" }),
                apiClient.get("/count/invoice", { cache: "force-cache" }),
                apiClient.get("/count/top/invoice", { cache: "force-cache" }),
                apiClient.get("/count/produk/MostFrequentProductId", { cache: "force-cache" }),
            ]);
            setCountProduct(resCountProduct.data.data);
            setCountQuotation(resCountQuotation.data.data);
            setTotalInvoice(resTotalInvoice.data.data);
            setTopInvoice(resTopInvoice.data.data);
            setTopProduct(resTopProduct.data.data);

            setIsLoading(false);
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <CircularProgress />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Dashboard Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-gray-600 text-sm mt-2 sm:mt-0">Data terkini di sistem Anda</p>
                    </div>

                    {/* Statistik Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Produk" value={countProduct} color="bg-indigo-600" />
                        <StatCard title="Total Quotation" value={countQuotation} color="bg-green-600" />
                        <StatCard
                            title="Total Invoice"
                            value={`Rp ${totalInvoice.toLocaleString()}`}
                            color="bg-blue-600"
                        />
                    </div>

                    {/* Produk Terbaik */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-700">Produk Terbaik</h2>
                        {topProduct ? (
                            <div className="mt-4 flex items-center space-x-4">
                                {/* Gambar produk */}
                                <Image src={`http://localhost:2000${topProduct.image}`} width={16} height={16} alt={topProduct.nama_produk} className="w-16 h-16 bg-gray-200 rounded-full" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{topProduct.nama_produk}</h3>
                                    <p className="text-sm text-gray-600">{topProduct.referensi}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Tidak ada data produk terbaik.</p>
                        )}
                    </div>
                    {/* Top Invoice */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Invoice</h2>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100">
                                    {["#", "Referensi Quotation", "Referensi Invoice", "Tanggal Invoice", "Total Pembayaran", "Status"].map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-3 border border-gray-200 text-left text-sm font-medium text-gray-600"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topInvoice.length > 0 ? (
                                    topInvoice.map((invoice, index) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 border border-gray-200">{index + 1}</td>
                                            <td className="px-4 py-3 border border-gray-200">{invoice.referensi_quotation}</td>
                                            <td className="px-4 py-3 border border-gray-200">{invoice.referensi_invoice}</td>
                                            <td className="px-4 py-3 border border-gray-200">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 border border-gray-200">Rp {invoice.total_pembayaran.toLocaleString()}</td>
                                            <td className="px-4 py-3 border border-gray-200">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className={`p-6 rounded-lg shadow-md text-white ${color}`}>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    const statusStyles = {
        Paid: "bg-green-100 text-green-600",
        Unpaid: "bg-red-100 text-red-600",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}
