import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
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
import { PostsTileViewPage } from './pages/posts/PostsTileViewPage';
import { UsersTileViewPage } from './pages/users/UsersTileViewPage';
import { ModalExamples } from './components/ui/ModalExamples';
import { FormModalExamples } from './components/ui/FormModalExamples';

// Define routes with authentication guards
const rootRoute = createRootRoute();

// Layout route
const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: MainLayout,
});

// Home page route - public
const homeRoute = createRoute({
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
const usersRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'users',
    beforeLoad: authGuard,
});

const usersListRoute = createRoute({
    getParentRoute: () => usersRoute,
    path: '/',
    component: UsersListPage,
});

// Tile view for users
const usersTileViewRoute = createRoute({
    getParentRoute: () => usersRoute,
    path: '/user-tiles',
    component: UsersTileViewPage,
});

const userDetailsRoute = createRoute({
    getParentRoute: () => usersRoute,
    path: '$userId',
    component: UserDetailsPage,
});

// Posts routes - protected
const postsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'posts',
    beforeLoad: authGuard,
});

const postsListRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '/',
    component: PostsListPage,
});

// Tile view for posts
const postsTileViewRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '/post-tiles',
    component: PostsTileViewPage,
});

const postDetailsRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId',
    component: PostDetailsPage,
});

const createPostRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: 'create',
    component: CreatePostPage,
});

const editPostRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId/edit',
    component: EditPostPage,
});

// Modal examples route - public
const modalExamplesRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'modals',
    component: ModalExamples,
});

// Form modal examples route - public
const formModalExamplesRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'forms',
    component: FormModalExamples,
});

// 404 route
const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFoundPage,
});

// Create and export the router
export const routeTree = rootRoute.addChildren([
    layoutRoute.addChildren([
        homeRoute,
        modalExamplesRoute,
        formModalExamplesRoute,
        usersTileViewRoute,
        postsTileViewRoute,
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

export const router = createRouter({ routeTree });

// Register router types
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}