/**
 * Avyakta Backend Client API
 * Proxies through Next.js /api/v1 with credentials: 'include'
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  status: number;
}

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CloudProgress {
  currentLevelId: string;
  completedLevels: string[];
  totalXP: number;
  rankId: string;
  rankTitle: string;
  rankTitleSanskrit: string;
  achievements: string[];
  levelProgress: Record<string, string[]>;
  updatedAt: string;
}

export interface GuestImportResult {
  success: boolean;
  importedLevelsCount: number;
  verifiedXpAwarded: number;
  achievementsUnlocked: string[];
  message: string;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('/api') ? path : `/api/v1${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : null;

    if (!res.ok) {
      const errDetail = body?.detail || body;
      return {
        status: res.status,
        error: {
          code: errDetail?.code || 'UNKNOWN_ERROR',
          message: errDetail?.message || (typeof errDetail === 'string' ? errDetail : 'An unexpected error occurred.'),
          details: errDetail?.details,
        },
      };
    }

    return {
      status: res.status,
      data: body,
    };
  } catch (err: any) {
    return {
      status: 0,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not connect to the server. Running in offline/guest mode.',
      },
    };
  }
}

export const api = {
  // Auth
  async getSession(): Promise<ApiResponse<{ authenticated: boolean; user?: any }>> {
    return request('/api/v1/auth/me');
  },

  async signup(data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ success: boolean; message: string; code?: string }>> {
    return request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    });
  },

  async login(data: {
    username: string;
    password: string;
  }): Promise<ApiResponse<{ authenticated: boolean; user: any }>> {
    return request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request('/api/v1/auth/logout', { method: 'POST' });
  },

  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async resendVerification(email: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    });
  },

  // Progress
  async getProgress(): Promise<ApiResponse<CloudProgress>> {
    return request('/api/v1/progress/me');
  },

  async completeTask(data: {
    levelId: string;
    taskId: string;
    perfectChallenge?: boolean;
  }): Promise<ApiResponse<CloudProgress>> {
    return request('/api/v1/progress/me/tasks', {
      method: 'POST',
      body: JSON.stringify({
        level_id: data.levelId,
        task_id: data.taskId,
        perfect_challenge: data.perfectChallenge,
      }),
    });
  },

  async importGuestProgress(guestData: any): Promise<ApiResponse<GuestImportResult>> {
    return request('/api/v1/progress/me/import-guest', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  },
};

export const apiClient = api;
