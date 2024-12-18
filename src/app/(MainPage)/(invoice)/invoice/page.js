"use client"
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { useSearch } from "@/app/hooks/useSearch";
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";
import { formatTanggal } from "@/app/shared/utils/dateTimeHelper";

export default function invoicePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dataInvoice, setDataInvoice] = useState([]);
    const [initialData, setInitialData] = useState([]);
    const { searchTerm, setSearchTerm } = useSearch(initialData, setDataInvoice, ['referensi_quotation', 'referensi_invoice',]);

    const fetchData = async () => {
        try {
            const [responseInvoice] = await Promise.all([
                apiClient.get('/salesInvoice', { cache: 'force-cache' }),
            ]);

            setDataInvoice(responseInvoice.data.data);
            setInitialData(responseInvoice.data.data);
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
        return dataInvoice.reduce((total, item) => total + (item.total_pembayaran || 0), 0);
    };

    return (
        <div className="p-4" >
            <h1 className="text-2xl font-bold">Invoice</h1>

            <div className="flex justify-between relative items-center my-5">
                <form>
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="default-search" className="block w-72 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Invoice" autoComplete="off" />
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
                                Reference Invoice
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Accounting Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Invoice Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Payment Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Total
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
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
                        ) : dataInvoice.length > 0 ? (
                            // Filter data untuk memastikan hanya satu referensi yang muncul 
                            dataInvoice.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.referensi_invoice}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.accounting_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.invoice_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatTanggal(item.payment_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-5 py-2 text-md font-bold rounded-3xl ${{
                                                Cancel: 'text-white bg-red-500',
                                                Posted: 'text-black bg-cyan-300',
                                                Received: 'text-black bg-purple-300',
                                                Paid: 'text-white bg-green-500',
                                                'Not Paid': 'text-white bg-red-500',
                                                Draft: 'text-white bg-gray-500',
                                            }[item.status] || 'text-black bg-gray-200'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        Rp. {item.total_pembayaran.toLocaleString()}
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
                        <tr className="bg-gray-100 font-bold">
                            <td className="px-4 py-2 border border-gray-300" colSpan='6' align="right">
                                Total
                            </td>
                            <td className="px-4 py-2 border border-gray-300 text-center">Rp. {getTotalKeseluruhan().toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}