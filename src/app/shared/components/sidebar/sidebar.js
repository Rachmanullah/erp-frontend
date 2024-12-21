"use client"
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useState } from "react";
import { ROUTES } from "../../routes/routes";

export default function Sidebar() {
    const pathname = usePathname();

    // State untuk menyimpan kategori yang sedang di-expand
    const [openCategory, setOpenCategory] = useState(null);

    // Fungsi untuk toggle expand/collapse
    const toggleCategory = (category) => {
        setOpenCategory(openCategory === category ? null : category);
    };

    const MENU_ITEMS = [
        {
            category: "Manufacturing",
            items: [
                { label: "Data Product", href: ROUTES.product },
                { label: "Data Bahan", href: ROUTES.bahan },
                { label: "BoM", href: ROUTES.BoM },
                { label: "Data Order", href: ROUTES.order },
            ],
        },
        {
            category: "Purchase",
            items: [
                { label: "Data Vendor", href: ROUTES.vendor },
                { label: "Data RFQ", href: ROUTES.rfq },
                { label: "Purchase Order", href: ROUTES.purchaseOrder },
            ],
        },
        {
            category: "Sales",
            items: [
                { label: "Data Customer", href: ROUTES.customer },
                { label: "Data Quotation", href: ROUTES.quotation },
                { label: "Sales Order", href: ROUTES.salesOrder },
            ],
        },
        {
            category: "Invoice",
            items: [
                { label: "Data Bill", href: ROUTES.bill },
                { label: "Data Invoice", href: ROUTES.invoice },
            ],
        },
    ];

    return (
        <div className="flex">
            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        {/* Dashboard */}
                        <li>
                            <Link
                                href={ROUTES.dashboard}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${pathname === ROUTES.dashboard ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                            >
                                <svg
                                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 2a8 8 0 1 0 8 8 8 8 0 0 0-8-8zM3 10a7 7 0 1 1 14 0H3z" />
                                </svg>
                                <span className="ms-3">Dashboard</span>
                            </Link>
                        </li>

                        {/* Iterasi melalui kategori menu */}
                        {MENU_ITEMS.map((menuCategory, index) => (
                            <li key={index}>
                                {/* Kategori (Title) */}
                                <button
                                    onClick={() => toggleCategory(menuCategory.category)}
                                    className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
                                >
                                    <span>{menuCategory.category}</span>
                                    {/* Icon Expand/Collapse */}
                                    <svg
                                        className={`w-5 h-5 transform transition-transform ${openCategory === menuCategory.category ? 'rotate-180' : 'rotate-0'}`}
                                        fill="currentColor" viewBox="0 0 20 20"
                                    >
                                        <path d="M5.516 7.548a.75.75 0 0 1 1.06 0L10 10.972l3.424-3.424a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06z" />
                                    </svg>
                                </button>

                                {/* Sub-menu */}
                                <ul
                                    className={`pl-6 mt-2 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${openCategory === menuCategory.category ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    {menuCategory.items.map((menu, subIndex) => (
                                        <li key={subIndex}>
                                            <Link
                                                href={menu.href}
                                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${pathname === menu.href ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                            >
                                                <span>{menu.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
