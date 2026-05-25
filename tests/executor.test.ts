import { describe, expect, test } from 'bun:test';
import type { ZentaoClient } from '../src/api/client';
import { DEFAULT_CONFIG } from '../src/config/defaults';
import { getModule } from '../src/modules';
import { executeModuleCommand } from '../src/modules/executor';

describe('module executor', () => {
    test('executes list commands and applies shared result processing', async () => {
        const requests: Array<{ method: string; path: string; options: unknown }> = [];
        const client = {
            async request(method: string, path: string, options: unknown) {
                requests.push({ method, path, options });
                return {
                    page: 1,
                    total: 2,
                    limit: 20,
                    products: [
                        { id: 1, name: '保留', status: 'active', desc: '<p>Hello</p>' },
                        { id: 2, name: '丢弃', status: 'closed', desc: '<p>Bye</p>' },
                    ],
                };
            },
        } as unknown as ZentaoClient;

        const result = await executeModuleCommand(
            client,
            getModule('product')!,
            'list',
            [],
            {
                filter: ['status:active'],
                search: ['保留'],
                pick: 'id,name,desc',
                page: '1',
                recPerPage: '20',
            },
            DEFAULT_CONFIG,
        );

        expect(requests).toEqual([
            {
                method: 'get',
                path: '/products',
                options: {
                    apiVersion: 'v1',
                    query: {
                        page: '1',
                        limit: '20',
                    },
                    body: undefined,
                },
            },
        ]);
        expect(result.isList).toBe(true);
        expect(result.fields).toEqual(['id', 'name', 'desc']);
        expect(result.pager).toEqual({ recTotal: 2, recPerPage: 20, pageID: 1 });
        expect(result.data).toEqual([
            { id: 1, name: '保留', desc: 'Hello' },
        ]);
    });

    test('executes get commands and applies object post-processing', async () => {
        const client = {
            async request() {
                return {
                    status: 'success',
                    user: { id: 1, realname: 'Admin', bio: '<p>Hello</p>' },
                };
            },
        } as unknown as ZentaoClient;

        const result = await executeModuleCommand(
            client,
            getModule('user')!,
            'get',
            ['1'],
            { pick: 'id,bio' },
            DEFAULT_CONFIG,
        );

        expect(result.isList).toBe(false);
        expect(result.fields).toEqual(['id', 'bio']);
        expect(result.data).toEqual({ id: 1, bio: 'Hello' });
        expect(result.rawResponse).toEqual({
            status: 'success',
            user: { id: 1, realname: 'Admin', bio: '<p>Hello</p>' },
        });
    });

    test('skips HTML conversion when disabled', async () => {
        const client = {
            async request() {
                return {
                    status: 'success',
                    products: [
                        { id: 1, name: '产品', desc: '<p>Hello</p>' },
                    ],
                };
            },
        } as unknown as ZentaoClient;

        const result = await executeModuleCommand(
            client,
            getModule('product')!,
            'list',
            [],
            { pick: 'id,desc' },
            { ...DEFAULT_CONFIG, htmlToMarkdown: false },
        );

        expect(result.data).toEqual([
            { id: 1, desc: '<p>Hello</p>' },
        ]);
    });

    test('executes write commands and retains raw response', async () => {
        const requests: Array<{ method: string; path: string; options: unknown }> = [];
        const rawResponse = { status: 'success', id: 7, message: 'created' };
        const client = {
            async request(method: string, path: string, options: unknown) {
                requests.push({ method, path, options });
                return rawResponse;
            },
        } as unknown as ZentaoClient;

        const result = await executeModuleCommand(
            client,
            getModule('user')!,
            'create',
            [],
            {
                account: 'dev1',
                realname: 'Dev One',
                password: 'secret',
            } as any,
            DEFAULT_CONFIG,
        );

        expect(requests).toEqual([
            {
                method: 'post',
                path: '/users',
                options: {
                    query: {},
                    body: {
                        account: 'dev1',
                        realname: 'Dev One',
                        password: 'secret',
                    },
                },
            },
        ]);
        expect(result.data).toEqual(rawResponse);
        expect(result.rawResponse).toEqual(rawResponse);
    });

    test('executes web API action commands', async () => {
        const requests: Array<{ method: string; path: string; options: unknown }> = [];
        const rawResponse = { status: 'success', data: 123 };
        const client = {
            async request(method: string, path: string, options: unknown) {
                requests.push({ method, path, options });
                return rawResponse;
            },
        } as unknown as ZentaoClient;

        const result = await executeModuleCommand(
            client,
            getModule('bug')!,
            'comment',
            ['26585', '--comment=CLI 备注'],
            {},
            DEFAULT_CONFIG,
        );

        expect(requests).toEqual([
            {
                method: 'post',
                path: '/bug-edit-26585-1.json',
                options: {
                    endpoint: 'web',
                    bodyFormat: 'form',
                    query: {},
                    body: {
                        comment: 'CLI 备注',
                    },
                },
            },
        ]);
        expect(result.data).toEqual(rawResponse);
    });

    test('throws when required write parameters are missing', async () => {
        const client = {
            async request() {
                throw new Error('should not request');
            },
        } as unknown as ZentaoClient;

        expect(executeModuleCommand(
            client,
            getModule('user')!,
            'create',
            [],
            { account: 'dev1', realname: 'Dev One' } as any,
            DEFAULT_CONFIG,
        )).rejects.toThrow('必须提供参数值');
    });
});
