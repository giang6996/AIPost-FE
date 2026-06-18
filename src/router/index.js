import {
  createRouter,
  createWebHashHistory,
  onBeforeRouteLeave,
  useRoute,
  useRouter,
} from "vue-router";
import { useAuthStore } from "@stores/authStore";

import AuthLayout from "@layouts/AuthLayout.vue";
import AppLayout from "@layouts/AppLayout.vue";

import LoginView from "@views/auth/LoginView.vue";
import RegisterView from "@views/auth/RegisterView.vue";
import DashboardView from "@views/dashboard/DashboardView.vue";
import SitesView from "@views/sites/SitesView.vue";
import DraftsView from "@views/drafts/DraftsView.vue";
import DraftEditorView from "@views/drafts/DraftEditorView.vue";
import SettingsView from "@views/settings/SettingsView.vue";
import ProfileView from "@views/profile/ProfileView.vue";

onBeforeRouteLeave((to, from, next) => {
  if (saveState.hasUnsavedChanges || saveState.isSaving) {
    const confirmed = window.confirm(
      "You have unsaved changes. Are you sure you want to leave this page?",
    );

    if (!confirmed) {
      return next(false);
    }
  }

  next();
});

const routes = [
  {
    path: "/",
    redirect: "/app/dashboard",
  },
  {
    path: "/",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: LoginView,
        meta: { guestOnly: true },
      },
      {
        path: "register",
        name: "register",
        component: RegisterView,
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: "/app",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: DashboardView,
      },
      {
        path: "sites",
        name: "sites",
        component: SitesView,
      },
      {
        path: "drafts",
        name: "drafts",
        component: DraftsView,
      },
      {
        path: "drafts/:id",
        name: "draft-editor",
        component: DraftEditorView,
      },
      {
        path: "settings",
        name: "settings",
        component: SettingsView,
      },
      {
        path: "profile",
        name: "profile",
        component: ProfileView,
      },
      {
        path: "/app/admin/users",
        name: "admin-users",
        component: () => import("@views/admin/adminUsersView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "/app/admin/drafts",
        name: "admin-drafts",
        component: () => import("@views/admin/adminDraftsView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "/app/admin/sites",
        name: "admin-sites",
        component: () => import("@views/admin/adminSitesView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    try {
      await authStore.initAuth();
    } catch (error) {
      console.error("Route auth init failed:", error);
    }
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: "dashboard" };
  }

  if (to.meta.requiresAdmin && authStore.user?.role?.name !== "admin") {
    return { path: "/app" };
  }

  return true;
});

export default router;
