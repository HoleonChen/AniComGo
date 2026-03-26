import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Comment } from '../../data/Model';
import commentService from '../../services/commentService';

const CommentAudit: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchComments = async (pageVal: number) => {
        setLoading(true);
        try {
            const { list, total } = await commentService.getCommentsToAudit(pageVal, 10);
            setComments(list);
            setTotal(total);
        } catch (error) {
             message.error("加载评论失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(page);
    }, [page]);

    const handleApprove = async (id: number) => {
        try {
            await commentService.auditComment(id, true);
            message.success(`评论 ${id} 已通过`);
            fetchComments(page);
        } catch (e) {
            message.error("通过失败");
        }
    };

    const handleReject = async (id: number) => {
         try {
            await commentService.auditComment(id, false);
            message.success(`评论 ${id} 已拒绝/隐藏`);
            fetchComments(page);
        } catch (e) {
            message.error("拒绝失败");
        }
    };

    const columns: ColumnsType<Comment> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: '用户ID',
            key: 'user',
            render: (_, record: any) => <b>{record.user?.username || record.userName || record.userId || record.user_id || '未知用户'}</b>,
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: {
                showTitle: false,
            },
            render: (content) => (
                <Tooltip placement="topLeft" title={content}>
                    {content}
                </Tooltip>
            ),
        },
        {
            title: '番剧 ID',
            key: 'animeId',
            width: 100,
            render: (_, record: any) => record.animeId || record.anime_id || '-',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 1 ? 'success' : 'error'}>
                    {status === 1 ? '已通过' : '已隐藏/拒绝'}
                </Tag>
            ),
        },
        {
            title: '创建时间',
            key: 'createdAt',
            width: 180,
            render: (_, record: any) => {
                const time = record.createdAt || record.created_at || record.createTime;
                return time ? new Date(time).toLocaleString() : '未知';
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="通过">
                        <Button 
                            type="primary" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleApprove(record.id)} 
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        />
                    </Tooltip>
                    <Tooltip title="拒绝/隐藏">
                        <Button 
                            type="primary" 
                            danger 
                            icon={<CloseOutlined />} 
                            onClick={() => handleReject(record.id)} 
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>评论审核</h2>
             <Table
                columns={columns}
                dataSource={comments}
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

export default CommentAudit;