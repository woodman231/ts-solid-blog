import { Outlet, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { getUserDisplayName, getUserInitial, getUserEmail } from '../../auth/userUtils';
import { useSocketStore } from '../../lib/socket';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

export function MainLayout() {
    const { isAuthenticated, user: account, login, logout } = useAuth();
    const { initialize, disconnect } = useSocketStore();

    // Initialize socket when authenticated
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isAuthenticated) {
            // Add a small delay to ensure authentication state is stable
            timeoutId = setTimeout(() => {
                initialize().catch((error) => {
                    console.error('Socket initialization failed:', error);
                    // Retry after a delay if initialization fails
                    setTimeout(() => {
                        initialize().catch(console.error);
                    }, 5000);
                });
            }, 100);
        } else {
            disconnect();
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isAuthenticated, initialize, disconnect]);

    // Handle page visibility changes to manage socket connections
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                // Page became visible again, ensure socket is connected
                setTimeout(() => {
                    const { connected } = useSocketStore.getState();
                    if (!connected) {
                        console.log('Page became visible, reconnecting socket...');
                        initialize().catch(console.error);
                    }
                }, 1000); // Small delay to ensure page is fully loaded
            } else if (document.visibilityState === 'hidden') {
                // Page became hidden, but don't disconnect immediately
                // Socket will handle reconnection automatically when page becomes visible
                console.log('Page became hidden, socket will auto-reconnect when visible');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, initialize]);

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Navigation items
    const navigation = [
        { name: 'Home', href: '/' },
        ...(isAuthenticated ? [
            { name: 'Users', href: '/users' },
            { name: 'Posts', href: '/posts' }
        ] : []),
    ];

    return (
        <div className="min-h-full">
            <Disclosure as="nav" className="bg-primary-800">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="text-white font-bold text-xl">Blog App</span>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="ml-10 flex items-baseline space-x-4">
                                            {navigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className="text-white hover:bg-primary-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="ml-4 flex items-center md:ml-6">
                                        {isAuthenticated ? (
                                            <Menu as="div" className="relative ml-3">
                                                <div>
                                                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                                                        <span className="sr-only">Open user menu</span>
                                                        <div className="h-8 w-8 rounded-full bg-primary-400 flex items-center justify-center text-white">
                                                            {getUserInitial(account)}
                                                        </div>
                                                    </Menu.Button>
                                                </div>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <div
                                                                    className={`${active ? 'bg-gray-100' : ''
                                                                        } block px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    Signed in as {getUserDisplayName(account)}
                                                                </div>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={handleLogout}
                                                                    className={`${active ? 'bg-gray-100' : ''
                                                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    Sign out
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        ) : (
                                            <button
                                                onClick={handleLogin}
                                                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-500"
                                            >
                                                Sign in
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="-mr-2 flex md:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-primary-800 p-2 text-primary-200 hover:bg-primary-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="md:hidden">
                            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="text-primary-100 hover:bg-primary-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="border-t border-primary-700 pb-3 pt-4">
                                {isAuthenticated ? (
                                    <div className="flex items-center px-5">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary-400 flex items-center justify-center text-white text-lg">
                                                {getUserInitial(account)}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-white">{getUserDisplayName(account)}</div>
                                            <div className="text-sm font-medium text-primary-200">{getUserEmail(account)}</div>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="mt-3 space-y-1 px-2">
                                    {isAuthenticated ? (
                                        <Disclosure.Button
                                            as="button"
                                            onClick={handleLogout}
                                            className="block rounded-md px-3 py-2 text-base font-medium text-primary-100 hover:bg-primary-700 hover:text-white w-full text-left"
                                        >
                                            Sign out
                                        </Disclosure.Button>
                                    ) : (
                                        <Disclosure.Button
                                            as="button"
                                            onClick={handleLogin}
                                            className="block rounded-md px-3 py-2 text-base font-medium text-primary-100 hover:bg-primary-700 hover:text-white w-full text-left"
                                        >
                                            Sign in
                                        </Disclosure.Button>
                                    )}
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}