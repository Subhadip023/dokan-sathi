import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
    FaTachometerAlt,
    FaBoxes,
    FaTags,
    FaUsers,
    FaShoppingCart,
    FaReceipt,
    FaChartLine,
    FaStore,
    FaUserCircle,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChevronRight
} from 'react-icons/fa';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const current_dokan = usePage().props.auth.current_dokan;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: FaTachometerAlt,
        },
        {
            name: 'Products',
            href: route('products.index'),
            active: route().current('products.index'),
            icon: FaBoxes,
        },
        {
            name: 'Price List',
            href: route('products.price-list'),
            active: route().current('products.price-list'),
            icon: FaTags,
        },
        {
            name: 'Customers',
            href: route('coustomers.index'),
            active: route().current('coustomers.*'),
            icon: FaUsers,
        },
        {
            name: 'Sales (POS)',
            href: route('sales.index'),
            active: route().current('sales.*'),
            icon: FaShoppingCart,
        },
        {
            name: 'Overhead Costs',
            href: route('overhead-costs.index'),
            active: route().current('overhead-costs.*'),
            icon: FaReceipt,
        },
        {
            name: 'P&L Report',
            href: route('reports.pnl'),
            active: route().current('reports.pnl'),
            icon: FaChartLine,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Mobile Top Navbar Header */}
            <div className="md:hidden bg-white text-gray-900 flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center space-x-2">
                    <Link href="/">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-indigo-600" />
                    </Link>
                    <span className="font-bold text-base text-gray-900 truncate max-w-[200px]">
                        {current_dokan?.name || 'Dokan Sathi'}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                    {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            {/* Mobile Overlay Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-white text-gray-700 flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen border-r border-gray-200 shadow-sm ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                {/* Sidebar Header Brand */}
                <div>
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-indigo-600 group-hover:scale-105 transition-transform" />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    Dokan Sathi
                                </span>
                                <span className="text-[11px] text-indigo-600 font-bold truncate max-w-[140px]">
                                    {current_dokan?.name || 'Store POS'}
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-gray-400 hover:text-gray-600 p-1"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Store Title Badge */}
                    {current_dokan && (
                        <div className="mx-4 mt-4 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center space-x-2 text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-semibold text-gray-700 truncate">
                                Store: <strong className="text-indigo-900">{current_dokan.name}</strong>
                            </span>
                        </div>
                    )}

                    {/* Navigation Links List */}
                    <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                                        item.active
                                            ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600 shadow-2xs'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon
                                            className={`h-4 w-4 transition-colors ${
                                                item.active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                                            }`}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.active && <FaChevronRight size={10} className="text-indigo-600" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Bottom Profile Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 truncate mr-2">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                                <span className="font-bold text-xs text-gray-900 block truncate">{user.name}</span>
                                <span className="text-[11px] text-gray-500 block truncate">{user.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Link
                                href={route('profile.edit')}
                                className="p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-200/60 transition-colors"
                                title="Edit Profile"
                            >
                                <FaUserCircle size={16} />
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Log Out"
                            >
                                <FaSignOutAlt size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Body */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Desktop Top Header Bar */}
                <header className="hidden md:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between shadow-xs">
                    <div>
                        {header ? (
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {header}
                            </h1>
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {current_dokan?.name || 'Dashboard'}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block uppercase font-bold">Store Active</span>
                            <span className="text-sm font-bold text-gray-800">{current_dokan?.name || 'Store'}</span>
                        </div>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mr-2">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    {user.name}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile Settings
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
