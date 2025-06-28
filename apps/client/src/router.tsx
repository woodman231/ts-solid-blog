import { Router, Route, RootRoute, redirect } from '@tanstack/react-router';
import { msalInstance } from './auth/msal';
import { MainLayout } from './components/layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { UsersListPage } from './pages/users/UsersListPage';
import { UserDetailsPage } from './pages/users/UserDetailsPage';
import { PostsListPage } from './pages/posts/PostsListPage';
import { PostDetailsPage } from './pages/posts/PostDetailsPage';
import { CreatePostPage } from './pages/posts/CreatePostPage';
import { EditPostPage } from './pages/posts/EditPostPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Define routes with authentication guards
const rootRoute = new RootRoute();

// Layout route
const layoutRoute = new Route({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: MainLayout,
});

// Home page route - public
const homeRoute = new Route({
    getParentRoute: () => layoutRoute,
    path: '/',
    component: HomePage,
});

// Auth guard for protected routes
const authGuard = () => {
    // Use synchronous MSAL methods for route guards
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        throw redirect({
            to: '/',
            search: {
                // Pass the redirect_to param so we can redirect back after login
                redirect_to: window.location.pathname + window.location.search,
            },
        });
    }
};

// Users routes - protected
const usersRoute = new Route({
    getParentRoute: () => layoutRoute,
    path: 'users',
    beforeLoad: authGuard,
});

const usersListRoute = new Route({
    getParentRoute: () => usersRoute,
    path: '/',
    component: UsersListPage,
});

const userDetailsRoute = new Route({
    getParentRoute: () => usersRoute,
    path: '$userId',
    component: UserDetailsPage,
});

// Posts routes - protected
const postsRoute = new Route({
    getParentRoute: () => layoutRoute,
    path: 'posts',
    beforeLoad: authGuard,
});

const postsListRoute = new Route({
    getParentRoute: () => postsRoute,
    path: '/',
    component: PostsListPage,
});

const postDetailsRoute = new Route({
    getParentRoute: () => postsRoute,
    path: '$postId',
    component: PostDetailsPage,
});

const createPostRoute = new Route({
    getParentRoute: () => postsRoute,
    path: 'create',
    component: CreatePostPage,
});

const editPostRoute = new Route({
    getParentRoute: () => postsRoute,
    path: '$postId/edit',
    component: EditPostPage,
});

// 404 route
const notFoundRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFoundPage,
});

// Create and export the router
export const routeTree = rootRoute.addChildren([
    layoutRoute.addChildren([
        homeRoute,
        usersRoute.addChildren([
            usersListRoute,
            userDetailsRoute,
        ]),
        postsRoute.addChildren([
            postsListRoute,
            postDetailsRoute,
            createPostRoute,
            editPostRoute,
        ]),
    ]),
    notFoundRoute,
]);

export const router = new Router({ routeTree });

// Register router types
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}