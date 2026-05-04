import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome - Dokan Sathi" />
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 selection:bg-indigo-500 selection:text-white">
                <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl min-h-screen flex flex-col">
                    <header className="flex justify-between items-center py-6 w-full">
                        <div className="flex items-center">
                            <ApplicationLogo className="block h-10 w-auto fill-current text-indigo-600" />
                            <span className="ml-3 text-2xl font-bold text-gray-800 font-serif">Dokan Sathi</span>
                        </div>
                        <nav className="flex flex-1 justify-end space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 transition font-medium shadow-sm"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-md px-4 py-2 text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 transition font-medium shadow-sm"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 transition font-medium shadow-sm hidden sm:inline-block"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex-1 flex flex-col items-center justify-center text-center pb-20">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 font-serif tracking-tight mb-6">
                            Smart Stock Management
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 px-4">
                            Dokan Sathi helps you keep track of your products, monitor low stock alerts, and manage your shop efficiently all in one place.
                        </p>

                        {!auth.user && (
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
                                <Link
                                    href={route('register')}
                                    className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 w-full sm:w-auto text-center"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm w-full sm:w-auto text-center"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                        {auth.user && (
                            <Link
                                href={route('dashboard')}
                                className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Go to Dashboard
                            </Link>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
