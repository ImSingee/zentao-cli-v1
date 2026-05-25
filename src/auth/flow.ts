import type { Profile } from '../types/index.js';
import { ZentaoClient } from '../api/client.js';
import { ZentaoError } from '../errors.js';
import { getCurrentProfile, getProfile, saveProfile, getProfileConfig, buildProfile } from '../config/store.js';
import { login, getEnvCredentials } from './login.js';

/** 已通过鉴权后的运行时上下文，供命令层发起 API 调用 */
export interface AuthContext {
    client: ZentaoClient;
    profile: Profile;
}

function createAuthenticatedClient(profile: Profile, options?: { insecure?: boolean; timeout?: number }): ZentaoClient {
    const config = getProfileConfig(profile);
    const clientOpts = {
        insecure: options?.insecure ?? config.insecure,
        timeout: options?.timeout ?? config.timeout,
    };

    return new ZentaoClient(profile.server, profile.token, {
        ...clientOpts,
        async onTokenExpired() {
            if (!profile.password) return undefined;

            const result = await login(profile.server, profile.account, profile.password, clientOpts);
            const refreshed = buildProfile(
                profile.server,
                profile.account,
                result.token,
                result.serverConfig,
                result.user,
                profile,
                profile.password,
            );
            saveProfile(refreshed);
            Object.assign(profile, refreshed);
            return result.token;
        },
    });
}

/**
 * 确保当前进程具备可用的禅道凭证。
 *
 * 解析顺序：
 * 1. 读取本地 `currentProfile`，若 Token 可用则直接复用并刷新 `lastUsedTime`
 * 2. 否则读取 `ZENTAO_*` 环境变量：优先 Token 校验，其次账号密码登录
 * 3. 均失败时抛出 {@link ZentaoError} `E1006`
 */
export async function ensureAuth(options?: { insecure?: boolean; timeout?: number }): Promise<AuthContext> {
    const currentProfile = getCurrentProfile();
    if (currentProfile?.token) {
        currentProfile.lastUsedTime = new Date().toISOString();
        saveProfile(currentProfile);
        return {
            client: createAuthenticatedClient(currentProfile, options),
            profile: currentProfile,
        };
    }

    const env = getEnvCredentials();
    if (env.url && env.account && (!currentProfile || (currentProfile.account === env.account && currentProfile.server === env.url))) {
        if (env.token) {
            const clientOpts = { insecure: options?.insecure, timeout: options?.timeout };
            const normalizedServer = env.url.replace(/\/+$/, '');
            const existingProfile = getProfile(env.account, normalizedServer);
            const profile = buildProfile(env.url, env.account, env.token, undefined, undefined, existingProfile);
            saveProfile(profile);
            return {
                client: createAuthenticatedClient(profile, clientOpts),
                profile,
            };
        }

        if (env.password) {
            const clientOpts = { insecure: options?.insecure, timeout: options?.timeout };
            const result = await login(env.url, env.account, env.password, clientOpts);
            const normalizedServer = env.url.replace(/\/+$/, '');
            const existingProfile = getProfile(env.account, normalizedServer);
            const profile = buildProfile(env.url, env.account, result.token, undefined, result.user, existingProfile, env.password);
            saveProfile(profile);
            return {
                client: createAuthenticatedClient(profile, clientOpts),
                profile,
            };
        }
    }

    throw new ZentaoError('E1006');
}

export function ensureDryRunAuth(options?: { insecure?: boolean; timeout?: number }): AuthContext {
    const currentProfile = getCurrentProfile();
    if (currentProfile?.server) {
        return {
            client: createAuthenticatedClient(currentProfile, options),
            profile: currentProfile,
        };
    }

    const env = getEnvCredentials();
    if (env.url) {
        const profile = buildProfile(env.url, env.account || '<dry-run>', env.token || '<dry-run>');
        return {
            client: createAuthenticatedClient(profile, options),
            profile,
        };
    }

    throw new ZentaoError('E1006');
}
