import type { ModuleAction, ModuleDefinition } from '../types/index.js';
import { MODULES as GENERATED_MODULES } from './registry.js';

const v1PagerGetter = { pageID: 'page', recTotal: 'total', recPerPage: 'limit', pageTotal: 'pageTotal' };

function pagingParams(): ModuleAction['params'] {
    return [
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
    ];
}

function deleteAction(name: 'product' | 'project' | 'execution', idName: string, idLabel: string): ModuleAction {
    return {
        apiVersion: 'v1',
        name: 'delete',
        display: `删除${idLabel.replace('ID', '')}`,
        type: 'delete',
        method: 'delete',
        path: `/${name}s/{${idName}}`,
        resultType: 'text',
        resultGetter: 'message',
        pathParams: {
            [idName]: idLabel,
        },
        render: 'action',
    };
}

const productFields: Record<string, Record<string, unknown>> = {
    name: { type: 'string', description: '产品名称' },
    program: { type: 'integer', description: '所属项目集' },
    code: { type: 'string', description: '产品代号' },
    line: { type: 'integer', description: '所属产品线' },
    PO: { type: 'string', description: '产品负责人' },
    QD: { type: 'string', description: '测试负责人' },
    RD: { type: 'string', description: '发布负责人' },
    type: { type: 'string', description: '产品类型' },
    status: { type: 'string', description: '产品状态' },
    desc: { type: 'string', description: '产品描述' },
    acl: { type: 'string', description: '访问控制' },
    whitelist: { type: 'array', items: { type: 'string' }, description: '白名单' },
};

const PRODUCT_V1_MODULE: ModuleDefinition = {
    name: 'product',
    display: '产品',
    description: '产品管理，使用禅道 RESTful API v1，支持获取产品列表、创建产品、获取产品详情、修改产品、删除产品',
    actions: [
        {
            apiVersion: 'v1',
            name: 'list',
            display: '获取产品列表',
            type: 'list',
            method: 'get',
            path: '/products',
            resultType: 'list',
            pagerGetter: { ...v1PagerGetter },
            resultGetter: 'products',
            params: pagingParams(),
        },
        {
            apiVersion: 'v1',
            name: 'create',
            display: '创建产品',
            type: 'create',
            method: 'post',
            path: '/products',
            resultType: 'object',
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: productFields,
                    required: ['name', 'program', 'code'],
                },
            },
        },
        {
            apiVersion: 'v1',
            name: 'get',
            display: '获取产品详情',
            type: 'get',
            method: 'get',
            path: '/products/{productID}',
            resultType: 'object',
            pathParams: {
                productID: '产品ID',
            },
        },
        {
            apiVersion: 'v1',
            name: 'update',
            display: '修改产品',
            type: 'update',
            method: 'put',
            path: '/product/{productID}',
            resultType: 'object',
            pathParams: {
                productID: '产品ID',
            },
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: productFields,
                },
            },
        },
        deleteAction('product', 'productID', '产品ID'),
    ],
};

const projectFields: Record<string, Record<string, unknown>> = {
    name: { type: 'string', description: '项目名称' },
    code: { type: 'string', description: '项目编号' },
    model: { type: 'string', description: '项目模型' },
    begin: { type: 'string', description: '计划开始日期' },
    end: { type: 'string', description: '计划结束日期' },
    products: { type: 'array', items: { type: 'number' }, description: '关联产品' },
    parent: { type: 'integer', description: '所属项目集' },
    PM: { type: 'string', description: '项目负责人' },
    budget: { type: 'integer', description: '项目预算金额' },
    budgetUnit: { type: 'string', description: '预算币种' },
    days: { type: 'integer', description: '可用工作日' },
    desc: { type: 'string', description: '项目描述' },
    acl: { type: 'string', description: '访问控制' },
    whitelist: { type: 'array', items: { type: 'string' }, description: '白名单' },
    auth: { type: 'string', description: '权限控制' },
};

const PROJECT_V1_MODULE: ModuleDefinition = {
    name: 'project',
    display: '项目',
    description: '项目管理，使用禅道 RESTful API v1，支持获取项目列表、创建项目、获取项目详情、修改项目、删除项目',
    actions: [
        {
            apiVersion: 'v1',
            name: 'list',
            display: '获取项目列表',
            type: 'list',
            method: 'get',
            path: '/projects',
            resultType: 'list',
            pagerGetter: { ...v1PagerGetter },
            resultGetter: 'projects',
            params: pagingParams(),
        },
        {
            apiVersion: 'v1',
            name: 'create',
            display: '创建项目',
            type: 'create',
            method: 'post',
            path: '/projects',
            resultType: 'object',
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: projectFields,
                    required: ['name', 'begin', 'end', 'products', 'code'],
                },
            },
        },
        {
            apiVersion: 'v1',
            name: 'get',
            display: '获取项目详情',
            type: 'get',
            method: 'get',
            path: '/projects/{projectID}',
            resultType: 'object',
            pathParams: {
                projectID: '项目ID',
            },
        },
        {
            apiVersion: 'v1',
            name: 'update',
            display: '修改项目',
            type: 'update',
            method: 'put',
            path: '/projects/{projectID}',
            resultType: 'object',
            pathParams: {
                projectID: '项目ID',
            },
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: projectFields,
                },
            },
        },
        deleteAction('project', 'projectID', '项目ID'),
    ],
};

const executionFields: Record<string, Record<string, unknown>> = {
    project: { type: 'integer', description: '所属项目' },
    name: { type: 'string', description: '执行名称' },
    code: { type: 'string', description: '执行代号' },
    begin: { type: 'string', description: '计划开始日期' },
    end: { type: 'string', description: '计划结束日期' },
    days: { type: 'integer', description: '可用工作日' },
    lifetime: { type: 'string', description: '执行类型' },
    PO: { type: 'string', description: '产品负责人' },
    PM: { type: 'string', description: '执行负责人' },
    QD: { type: 'string', description: '测试负责人' },
    RD: { type: 'string', description: '发布负责人' },
    teamMembers: { type: 'array', items: { type: 'string' }, description: '团队成员' },
    desc: { type: 'string', description: '执行描述' },
    acl: { type: 'string', description: '访问控制' },
    whitelist: { type: 'array', items: { type: 'string' }, description: '白名单' },
};

const EXECUTION_V1_MODULE: ModuleDefinition = {
    name: 'execution',
    display: '执行',
    description: '执行管理，使用禅道 RESTful API v1，支持获取项目的执行列表、创建执行、获取执行详情、修改执行、删除执行',
    actions: [
        {
            apiVersion: 'v1',
            name: 'list',
            display: '获取项目的执行列表',
            type: 'list',
            method: 'get',
            path: '/projects/{projectID}/executions',
            resultType: 'list',
            pagerGetter: { ...v1PagerGetter },
            resultGetter: 'executions',
            pathParams: {
                projectID: '项目ID',
            },
            params: pagingParams(),
        },
        {
            apiVersion: 'v1',
            name: 'create',
            display: '创建执行',
            type: 'create',
            method: 'post',
            path: '/projects/{projectID}/executions',
            resultType: 'object',
            pathParams: {
                projectID: '项目ID',
            },
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: executionFields,
                    required: ['project', 'name', 'code', 'begin', 'end'],
                },
            },
        },
        {
            apiVersion: 'v1',
            name: 'get',
            display: '获取执行详情',
            type: 'get',
            method: 'get',
            path: '/executions/{executionID}',
            resultType: 'object',
            pathParams: {
                executionID: '执行ID',
            },
        },
        {
            apiVersion: 'v1',
            name: 'update',
            display: '修改执行',
            type: 'update',
            method: 'put',
            path: '/executions/{executionID}',
            resultType: 'object',
            pathParams: {
                executionID: '执行ID',
            },
            requestBody: {
                required: true,
                type: 'object',
                schema: {
                    type: 'object',
                    properties: executionFields,
                    required: ['project', 'name', 'code', 'begin', 'end'],
                },
            },
        },
        deleteAction('execution', 'executionID', '执行ID'),
    ],
};

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
        name: 'assign',
        display: '指派Bug',
        type: 'action',
        method: 'post',
        path: '/bugs/{bugID}/assign',
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
                    mailto: { type: 'array', items: { type: 'string' }, description: '抄送给' },
                    comment: { type: 'string', description: '备注' },
                },
                required: ['assignedTo'],
            },
        },
    },
    {
        endpoint: 'web',
        name: 'comment',
        display: '添加Bug备注',
        type: 'action',
        method: 'post',
        path: '/bug-edit-{bugID}-1.json',
        bodyFormat: 'form',
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
                required: ['comment'],
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
    description: 'Bug管理，使用禅道 RESTful API v1，支持获取产品Bug列表、创建Bug、获取Bug详情、修改Bug、删除Bug、确认Bug、关闭Bug、激活Bug、指派Bug、添加备注、解决Bug',
    actions: bugActions,
};

export const MODULES: ModuleDefinition[] = GENERATED_MODULES.map((mod) => (
    mod.name === 'product' ? PRODUCT_V1_MODULE :
    mod.name === 'project' ? PROJECT_V1_MODULE :
    mod.name === 'execution' ? EXECUTION_V1_MODULE :
    mod.name === 'bug' ? BUG_V1_MODULE : mod
));
