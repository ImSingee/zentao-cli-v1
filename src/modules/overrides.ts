import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { MODULES as GENERATED_MODULES } from './registry.js';

const bugFields: Record<string, Record<string, unknown>> = {
    branch: { type: 'integer', description: '所属分支' },
    module: { type: 'integer', description: '所属模块' },
    execution: { type: 'integer', description: '所属执行' },
    title: { type: 'string', description: 'Bug标题' },
    keywords: { type: 'string', description: '关键词' },
    severity: { type: 'integer', description: '严重程度' },
    pri: { type: 'integer', description: '优先级' },
    type: { type: 'string', description: 'Bug类型' },
    os: { type: 'string', description: '操作系统' },
    browser: { type: 'string', description: '浏览器' },
    steps: { type: 'string', description: '重现步骤' },
    task: { type: 'integer', description: '相关任务' },
    story: { type: 'integer', description: '相关需求' },
    deadline: { type: 'string', description: '截止日期' },
    openedBuild: {
        type: 'array',
        items: { type: 'string' },
        description: '影响版本',
    },
};

const bugWriteSchema = {
    type: 'object',
    properties: bugFields,
    required: ['title', 'severity', 'pri', 'type'],
};

const bugActions: ModuleAction[] = [
    {
        apiVersion: 'v1',
        name: 'list',
        display: '获取产品Bug列表',
        type: 'list',
        method: 'get',
        path: '/products/{productID}/bugs',
        resultType: 'list',
        pagerGetter: { pageID: 'page', recTotal: 'total', recPerPage: 'limit', pageTotal: 'pageTotal' },
        resultGetter: 'bugs',
        pathParams: {
            productID: '产品ID',
        },
        params: [
            {
                name: 'page',
                required: false,
                type: 'number',
                description: '页码，从第1页开始',
            },
            {
                name: 'limit',
                required: false,
                type: 'number',
                description: '每页数量',
            },
        ],
    },
    {
        apiVersion: 'v1',
        name: 'create',
        display: '创建Bug',
        type: 'create',
        method: 'post',
        path: '/products/{productID}/bugs',
        resultType: 'object',
        pathParams: {
            productID: '产品ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: bugWriteSchema,
        },
    },
    {
        apiVersion: 'v1',
        name: 'get',
        display: '获取Bug详情',
        type: 'get',
        method: 'get',
        path: '/bugs/{bugID}',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
    },
    {
        apiVersion: 'v1',
        name: 'update',
        display: '修改Bug',
        type: 'update',
        method: 'put',
        path: '/bugs/{bugID}',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: bugWriteSchema,
        },
    },
    {
        apiVersion: 'v1',
        name: 'delete',
        display: '删除Bug',
        type: 'delete',
        method: 'delete',
        path: '/bugs/{bugID}',
        resultType: 'text',
        resultGetter: 'message',
        pathParams: {
            bugID: 'Bug ID',
        },
        render: 'action',
    },
    {
        apiVersion: 'v1',
        name: 'confirm',
        display: '确认Bug',
        type: 'action',
        method: 'post',
        path: '/bugs/{bugID}/confirm',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: {
                type: 'object',
                properties: {
                    assignedTo: { type: 'string', description: '指派给' },
                    type: { type: 'string', description: 'Bug类型' },
                    mailto: { type: 'array', items: { type: 'string' }, description: '抄送给' },
                    comment: { type: 'string', description: '备注' },
                    pri: { type: 'integer', description: '优先级' },
                },
            },
        },
    },
    {
        apiVersion: 'v1',
        name: 'close',
        display: '关闭Bug',
        type: 'action',
        method: 'post',
        path: '/bugs/{bugID}/close',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: {
                type: 'object',
                properties: {
                    comment: { type: 'string', description: '备注' },
                },
            },
        },
    },
    {
        apiVersion: 'v1',
        name: 'activate',
        display: '激活Bug',
        type: 'action',
        method: 'post',
        path: '/bugs/{bugID}/active',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: {
                type: 'object',
                properties: {
                    assignedTo: { type: 'string', description: '指派给' },
                    openedBuild: { type: 'array', items: { type: 'string' }, description: '影响版本' },
                    comment: { type: 'string', description: '备注' },
                },
            },
        },
    },
    {
        apiVersion: 'v1',
        name: 'resolve',
        display: '解决Bug',
        type: 'action',
        method: 'post',
        path: '/bugs/{bugID}/resolve',
        resultType: 'object',
        pathParams: {
            bugID: 'Bug ID',
        },
        requestBody: {
            required: true,
            type: 'object',
            schema: {
                type: 'object',
                properties: {
                    resolution: { type: 'string', description: '解决方案' },
                    duplicateBug: { type: 'integer', description: '重复Bug ID' },
                    resolvedBuild: { type: 'string', description: '解决版本' },
                    resolvedDate: { type: 'string', description: '解决时间' },
                    assignedTo: { type: 'string', description: '指派给' },
                    comment: { type: 'string', description: '备注' },
                },
                required: ['resolution'],
            },
        },
    },
];

const BUG_V1_MODULE: ModuleDefinition = {
    name: 'bug',
    display: 'Bug',
    description: 'Bug管理，使用禅道 RESTful API v1，支持获取产品Bug列表、创建Bug、获取Bug详情、修改Bug、删除Bug、确认Bug、关闭Bug、激活Bug、解决Bug',
    actions: bugActions,
};

export const MODULES: ModuleDefinition[] = GENERATED_MODULES.map((mod) => (
    mod.name === 'bug' ? BUG_V1_MODULE : mod
));
