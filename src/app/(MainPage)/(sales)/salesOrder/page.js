"use client"
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function SalesOrderPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataSalesOrder, setDataSalesOrder] = useState([]);
    const [initialData, setInitialData] = useState([]);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataSalesOrder, ['nama_customer', 'total_pembayaran', 'referensi_quotation', 'confirmation_date', 'arrival_date', 'status']);

    const fetchData = async () => {
        try {
            await apiClient.get('/salesOrder', { cache: 'force-cache' })
                .then((res) => {
                    setDataSalesOrder(res.data.data);
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
        fetchData();
    }, []);

    return (
        <div className="p-4" >
            <h1 className="text-2xl font-bold">Sales Order</h1>
            <div className="flex justify-between relative items-center py-3">
                <form>
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search data" autoComplete="off" />
                    </div>
                </form>
            </div>

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
                                Confirmed Order
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Customer
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Total
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
                        ) : dataSalesOrder.length > 0 ? (
                            // Filter data untuk memastikan hanya satu referensi yang muncul 
                            dataSalesOrder.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.referensi_quotation}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.confirmation_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.nama_customer}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.total_pembayaran}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link href={ROUTES.detailsalesOrder(item.id)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detail</Link>
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