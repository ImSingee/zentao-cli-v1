import { describe, test, expect } from 'bun:test';
import { MODULES, getModule, getModuleNames, isModuleName } from '../src/modules';
import { findAction, getAvailableActions, resolveActionUrl, resolveModuleCommand } from '../src/modules';
import type { Workspace } from '../src/types/config';

    describe('module registry', () => {
    test('contains expected modules', () => {
        const names = getModuleNames();
        expect(names).toContain('product');
        expect(names).toContain('bug');
        expect(names).toContain('task');
        expect(names).toContain('story');
        expect(names).toContain('user');
        expect(names.length).toBe(19);
    });

    test('getModule returns module by name', () => {
        const mod = getModule('product');
        expect(mod).toBeDefined();
        expect(mod!.name).toBe('product');
        const listAction = findAction(mod!, 'list');
        expect(listAction).toBeDefined();
        expect(listAction!.path).toBe('/products');
    });

    test('getModule is case insensitive', () => {
        expect(getModule('Product')).toBeDefined();
        expect(getModule('BUG')).toBeDefined();
    });

    test('getModule returns undefined for unknown module', () => {
        expect(getModule('nonexistent')).toBeUndefined();
    });

    test('isModuleName identifies valid modules', () => {
        expect(isModuleName('product')).toBe(true);
        expect(isModuleName('unknown')).toBe(false);
    });

    test('bug module has correct actions', () => {
        const bug = getModule('bug')!;
        const actions = bug.actions.map((a) => a.name);
        expect(actions).toContain('resolve');
        expect(actions).toContain('close');
        expect(actions).toContain('activate');
        expect(actions).toContain('confirm');
        expect(bug.actions.every((a) => a.apiVersion === 'v1')).toBe(true);
    });

    test('task module has correct actions', () => {
        const task = getModule('task')!;
        const actions = task.actions.map((a) => a.name);
        expect(actions).toContain('start');
        expect(actions).toContain('finish');
        expect(actions).toContain('close');
        expect(actions).toContain('activate');
    });

    test('product module has list operation', () => {
        const product = getModule('product')!;
        const listAction = findAction(product, 'list');
        expect(listAction).toBeDefined();
        expect(listAction!.name).toBe('list');
        expect(listAction!.apiVersion).toBe('v1');
    });

    test('product project and execution modules use v1 actions', () => {
        for (const name of ['product', 'project', 'execution']) {
            const mod = getModule(name)!;
            expect(mod.actions.every((a) => a.apiVersion === 'v1')).toBe(true);
        }
    });

    test('bug module uses v1 product-scoped list', () => {
        const bug = getModule('bug')!;
        const listAction = findAction(bug, 'list');
        expect(listAction).toBeDefined();
        expect(listAction!.path).toBe('/products/{productID}/bugs');
        expect(listAction!.apiVersion).toBe('v1');
    });
});

describe('module resolver', () => {
    const workspace: Workspace = {
        id: 1,
        product: { id: 10, name: '产品1' },
        project: { id: 20, name: '项目1' },
        execution: { id: 30, name: '执行1' },
    };

    test('resolves detail path', () => {
        const mod = getModule('product')!;
        const getAction = findAction(mod, 'get')!;
        expect(resolveActionUrl(getAction, { productID: 1 })).toBe('/products/1');
    });

    test('resolves action path', () => {
        const mod = getModule('bug')!;
        const action = findAction(mod, 'action', 'resolve')!;
        expect(resolveActionUrl(action, { bugID: 5 })).toBe('/bugs/5/resolve');
        expect(action.method).toBe('post');
    });

    test('resolves v1 bug list path and paging params', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'list',
            { product: '10', page: '2', recPerPage: '50' },
            [],
        );

        expect(command.path).toBe('/products/10/bugs');
        expect(command.query).toEqual({ page: '2', limit: '50' });
        expect(command.action.apiVersion).toBe('v1');
    });

    test('resolves v1 bug create path from product option', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'create',
            {
                product: '10',
                title: 'Bug title',
                severity: '2',
                pri: '1',
                type: 'codeerror',
            } as any,
            [],
        );

        expect(command.path).toBe('/products/10/bugs');
        expect(command.data).toMatchObject({
            title: 'Bug title',
            severity: 2,
            pri: 1,
            type: 'codeerror',
        });
        expect(command.action.apiVersion).toBe('v1');
    });

    test('only parses dynamic request body fields from --key=value arguments', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'resolve',
            {},
            ['26559', '--resolution=fixed', '--comment', '原因：已修复'],
        );

        expect(command.path).toBe('/bugs/26559/resolve');
        expect(command.data).toMatchObject({ resolution: 'fixed' });
        expect((command.data as Record<string, unknown>).comment).toBeUndefined();
    });

    test('parses multiline dynamic request body fields from --key=value arguments', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'resolve',
            {},
            ['26559', '--resolution=fixed', '--comment=原因：已修复\n修复：已验证'],
        );

        expect(command.data).toMatchObject({
            resolution: 'fixed',
            comment: '原因：已修复\n修复：已验证',
        });
    });

    test('html encodes request body comments before submission', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'resolve',
            {},
            ['26559', '--resolution=external', '--comment=原因：<think>上游</think> & "不予解决"'],
        );

        expect(command.data).toMatchObject({
            resolution: 'external',
            comment: '原因：&lt;think&gt;上游&lt;/think&gt; &amp; &quot;不予解决&quot;',
        });
    });

    test('html encodes request body comments from command options', () => {
        const mod = getModule('bug')!;
        const command = resolveModuleCommand(
            mod,
            'resolve',
            { resolution: 'external', comment: '<think>外部原因</think>' } as any,
            ['26559'],
        );

        expect(command.data).toMatchObject({
            resolution: 'external',
            comment: '&lt;think&gt;外部原因&lt;/think&gt;',
        });
    });

    test('throws for unknown action', () => {
        const mod = getModule('bug')!;
        expect(findAction(mod, 'action', 'nonexistent')).toBeUndefined();
    });

    test('getAvailableActions returns action names', () => {
        const mod = getModule('story')!;
        const actions = getAvailableActions(mod);
        expect(actions).toContain('change');
        expect(actions).toContain('close');
        expect(actions).toContain('activate');
    });

    test('supports positional id for update action', () => {
        const mod = getModule('product')!;
        const command = resolveModuleCommand(
            mod,
            'update',
            {},
            ['1', '--name=产品1'],
        );
        expect(command.id).toBe(1);
        expect(command.path).toBe('/product/1');
        expect(command.data).toMatchObject({ name: '产品1' });
    });

    test('resolves v1 project get action', () => {
        const mod = getModule('project')!;
        const command = resolveModuleCommand(
            mod,
            'get',
            {},
            ['12'],
        );

        expect(command.path).toBe('/projects/12');
        expect(command.action.apiVersion).toBe('v1');
    });

    test('resolves v1 execution list path from project option', () => {
        const mod = getModule('execution')!;
        const command = resolveModuleCommand(
            mod,
            'list',
            { project: '12', page: '2', recPerPage: '50' },
            [],
        );

        expect(command.path).toBe('/projects/12/executions');
        expect(command.query).toEqual({ page: '2', limit: '50' });
        expect(command.action.apiVersion).toBe('v1');
    });

    test('supports positional id for delete action', () => {
        const mod = getModule('product')!;
        const command = resolveModuleCommand(
            mod,
            'delete',
            {},
            ['1'],
        );
        expect(command.id).toBe(1);
        expect(command.path).toBe('/products/1');
    });
});
