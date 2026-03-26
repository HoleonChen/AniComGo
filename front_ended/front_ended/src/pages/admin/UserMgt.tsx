import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Avatar } from 'antd';
import { UserOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../../data/Model';
import userService from '../../services/userService';

const UserMgt: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchUsers = async (pageVal: number) => {
        setLoading(true);
        try {
            const { list, total } = await userService.getUsers(pageVal, 10);
            setUsers(list);
            setTotal(total);
        } catch (error) {
             message.error("加载用户失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const handleBan = async (id: number) => {
        try {
             await userService.updateStatus(id, 0); // 0 = banned
             message.success(`用户 ${id} 已封禁`);
             fetchUsers(page);
        } catch (e) {
             message.error("封禁用户失败");
        }
    };

    const handleUnban = async (id: number) => {
         try {
             await userService.updateStatus(id, 1); // 1 = active
             message.success(`用户 ${id} 已解封`);
             fetchUsers(page);
        } catch (e) {
             message.error("解封用户失败");
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: '头像',
            dataIndex: 'avatar_url',
            key: 'avatar_url',
            render: (url) => <Avatar src={url} icon={<UserOutlined />} />,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: number) => (
                <Tag color={role === 1 ? 'gold' : 'blue'}>
                    {role === 1 ? '管理员' : '普通用户'}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 1 ? 'success' : 'error'}>
                    {status === 1 ? '正常' : '封禁'}
                </Tag>
            ),
        },
        {
            title: '注册时间',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.role !== 1 && ( // Don't ban admins
                        <Button 
                            danger={record.status === 1}
                            type={record.status === 0 ? 'primary' : 'default'}
                            icon={record.status === 1 ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => record.status === 1 ? handleBan(record.id) : handleUnban(record.id)}
                        >
                            {record.status === 1 ? '封禁' : '解封'}
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>用户管理</h2>
            <Table
                columns={columns}
                dataSource={users} // Use state users instead of mockUsers
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: 10,
                    total: total,
                    onChange: (p) => setPage(p),
                }}
            />
        </div>
    );
};

export default UserMgt;