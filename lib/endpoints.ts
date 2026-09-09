export const API_ENDPOINTS = {
  auth: {
    signup: "/auth/create-user",
    signin: "/auth/login",
    refresh: "/auth/token",
    sendEmailOtp: "/auth/send-email-otp",
    verifyEmailOtp: "/auth/verify-email-otp",
    forgotPassword: "/auth/forgot-password",
    sendPasswordResetOtp: "/auth/send-password-reset-otp",
    verifyPasswordResetOtp: "/auth/verify-password-reset-otp",
    resetPassword: (token: string) => `/auth/reset-password?token=${token}`,
    updatePassword: "/auth/update-password",
    getProfile: "/auth/get-profile",
    updateProfile: "/auth/update-profile",
    // POST, not DELETE: the password confirming it travels in the body.
    deleteAccount: "/auth/delete-account",
  },

  admin: {
    stats: "/admin/stats",

    users: {
      list: (query = "") => `/admin/users${query}`,
      detail: (userId: string) => `/admin/users/${userId}`,
      updateStatus: (userId: string) => `/admin/users/${userId}/status`,
      wallet: (userId: string) => `/admin/users/${userId}/wallet`,
      walletTransactions: (userId: string) => `/admin/users/${userId}/wallet/transactions`,
      walletAdjust: (userId: string) => `/admin/users/${userId}/wallet/adjust`,
    },

    shipments: {
      list: (query = "") => `/admin/shipments${query}`,
      detail: (shipmentId: string) => `/admin/shipments/${shipmentId}`,
      transition: (shipmentId: string) => `/admin/shipments/${shipmentId}/transition`,
    },

    kyc: {
      list: (query = "") => `/admin/kyc${query}`,
      detail: (submissionId: string) => `/admin/kyc/${submissionId}`,
      review: (submissionId: string) => `/admin/kyc/${submissionId}/review`,
    },

    withdrawals: {
      list: (query = "") => `/admin/withdrawals${query}`,
      decide: (withdrawalId: string) => `/admin/withdrawals/${withdrawalId}/decide`,
    },

    // S12 — super-admin-only admin management (server lands with that batch)
    admins: {
      list: "/admin/admins",
      create: "/admin/admins",
      updateStatus: (adminId: string) => `/admin/admins/${adminId}/status`,
      remove: (adminId: string) => `/admin/admins/${adminId}`,
    },
  },

  customer: {
    addresses: {
      list: "/customer/addresses",
      create: "/customer/addresses",
      update: (addressId: string) => `/customer/addresses/${addressId}`,
      remove: (addressId: string) => `/customer/addresses/${addressId}`,
      setDefault: (addressId: string) => `/customer/addresses/${addressId}/default`,
    },
    lookups: {
      countries: "/customer/lookups/countries",
      states: (country: string) => `/customer/lookups/states?country=${country}`,
      cities: (country: string, state: string) => `/customer/lookups/cities?country=${country}&state=${encodeURIComponent(state)}`,
      categories: (search: string) => `/customer/lookups/categories?search=${encodeURIComponent(search)}`,
    },
    quotes: "/customer/quotes",
    shipments: {
      list: (query = "") => `/customer/shipments${query}`,
      create: "/customer/shipments",
      detail: (shipmentId: string) => `/customer/shipments/${shipmentId}`,
      tracking: (shipmentId: string) => `/customer/shipments/${shipmentId}/tracking`,
      trackByReference: (reference: string) => `/customer/shipments/track/${reference}`,
      cancel: (shipmentId: string) => `/customer/shipments/${shipmentId}/cancel`,
      pay: (shipmentId: string) => `/customer/shipments/${shipmentId}/pay`,
    },
    wallet: {
      balance: "/customer/wallet",
      transactions: "/customer/wallet/transactions",
      fundingAccount: "/customer/wallet/funding-account",
      sync: "/customer/wallet/sync",
      banks: "/customer/wallet/banks",
      resolveAccount: "/customer/wallet/resolve-account",
      withdrawals: "/customer/wallet/withdrawals",
      withdrawalsSync: "/customer/wallet/withdrawals/sync",
    },
    kyc: {
      status: "/customer/kyc",
      submit: "/customer/kyc",
    },
    notifications: {
      list: (query = "") => `/notifications${query}`,
      unreadCount: "/notifications/unread-count",
      read: (notificationId: string) => `/notifications/${notificationId}/read`,
      readAll: "/notifications/read-all",
    },
  },
} as const;
