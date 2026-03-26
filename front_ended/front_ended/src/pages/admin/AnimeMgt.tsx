import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Tag as AntTag, Image, Spin, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Anime, Tag, Studio } from '../../data/Model';
import animeService from '../../services/animeService';
import fileService from '../../services/fileService';

// Mock some tags and studios for selection since we don't have APIs
const mockTagsList: Tag[] = [
    { id: 1, name: '冒险' },
    { id: 2, name: '动作' },
    { id: 3, name: '喜剧' },
    { id: 4, name: '日常' },
    { id: 5, name: '剧情' },
];

const mockStudios: Studio[] = [
    { id: 1, name: '京都动画' },
    { id: 2, name: 'MAPPA' },
    { id: 3, name: 'WIT STUDIO' },
    { id: 4, name: '骨头社' },
];

const AnimeMgt: React.FC = () => {
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
    const [form] = Form.useForm();
    const [editingLoading, setEditingLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    
    const fetchAnimes = async (currentPage: number) => {
        setLoading(true);
        try {
            const { list, total } = await animeService.getAnimes(currentPage, 10);
            setAnimes(list);
            setTotal(total);
        } catch (error) {
            message.error('获取番剧列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimes(page);
    }, [page]);
    
    const columns: ColumnsType<Anime> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: '海报',
            dataIndex: 'poster_url',
            key: 'poster_url',
            render: (url) => <Image src={url} width={50} />,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
        },
         {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <AntTag color="blue">{type}</AntTag>,
        },
        {
            title: '集数',
            dataIndex: 'total_episodes',
            key: 'total_episodes',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap: Record<number, string> = { 0: '未开播', 1: '连载中', 2: '已完结' };
                const colorMap: Record<number, string> = { 0: 'default', 1: 'processing', 2: 'success' };
                return <AntTag color={colorMap[status]}>{statusMap[status]}</AntTag>;
            },
        },
        {
            title: '评分',
            dataIndex: 'rating',
            key: 'rating',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record: Anime) => {
        setEditingAnime(record);
        // Prepare form data. 
        // For tags and studios, we just extract IDs for the Select components
        const formData = {
            ...record,
            tags: record.tags.map(t => t.id),
            studios: record.studios.map(s => s.id),
        } as any; // Cast to bypass type check for poster_url as Upload expects fileList

        form.setFieldsValue(formData);
        
        // Initialize File List if editing and poster_url exists
        if (record.poster_url) {
            setFileList([
                {
                    uid: '-1',
                    name: 'poster.png',
                    status: 'done',
                    url: record.poster_url,
                },
            ]);
        } else {
            setFileList([]);
        }

        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '确认删除这部番剧吗？',
            content: '此操作无法撤销。',
            onOk: async () => {
                const success = await animeService.deleteAnime(id);
                if (success) {
                    message.success('删除成功');
                    fetchAnimes(page);
                } else {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleAdd = () => {
        setEditingAnime(null);
        setFileList([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            setEditingLoading(true);
            try {
                let posterUrl = editingAnime?.poster_url || '';

                // Handle Image Upload First
                if (fileList.length > 0) {
                     const file = fileList[0];
                     if (file.originFileObj) {
                         // New file uploaded
                         try {
                             const url: string = await fileService.uploadImage(file.originFileObj as File);
                             posterUrl = url;
                         } catch (uploadError) {
                             message.error('图片上传失败');
                             setEditingLoading(false);
                             return;
                         }
                     } else if (file.url) {
                         // Existing file
                         posterUrl = file.url;
                     }
                } else {
                     message.error('请上传海报图片');
                     setEditingLoading(false);
                     return;
                }

                // Transform selected IDs back to objects for tags and studios
                // Note: The backend likely expects IDs in a specific format, but here we transform to match Anime type 
                // OR we map it in the service. The service `mapAnimeToApi` handles basic mapping, 
                // but usually backend expects `tagIds` not full tag objects.
                // Optimistically assuming Frontend `Anime` type structure for now, but 
                // let's adjust for typical ID based submission if needed.
                // Here we will just pass properties as they are used in `animeService.mapAnimeToApi`
                // which might need updating if backend expects strictly APIs.
                
                // Construct payload
                const payload: any = {
                    ...values,
                    poster_url: posterUrl,
                    id: editingAnime ? editingAnime.id : undefined,
                    release_date: values.release_date || new Date().toISOString().split('T')[0],
                    // We might need to handle tags/studios better if backend API is strict
                };

                let success;
                if (editingAnime) {
                    success = await animeService.updateAnime(editingAnime.id, payload);
                } else {
                    success = await animeService.createAnime(payload);
                }

                if (success) {
                    message.success(editingAnime ? '更新成功' : '添加成功');
                    setIsModalOpen(false);
                    fetchAnimes(page);
                } else {
                    message.error('操作失败');
                }
            } catch (error) {
                console.error(error);
                message.error('发生错误');
            } finally {
                setEditingLoading(false);
            }
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    // File List Handler
    const handleUploadChange = ({ fileList: newFileList }: any) => {
        // Limit to 1 file
        setFileList(newFileList.slice(-1)); 
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>番剧管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加番剧
                </Button>
            </div>
            
            {loading && !animes.length ? (
                 <div style={{ textAlign: 'center', margin: '40px' }}><Spin /></div>
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={animes} 
                    rowKey="id" 
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total: total,
                        onChange: (newPage) => setPage(newPage)
                    }}
                />
            )}

            <Modal
                title={editingAnime ? "编辑番剧" : "添加番剧"}
                open={isModalOpen}
                onOk={handleOk}
                confirmLoading={editingLoading}
                onCancel={handleCancel}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ status: 0, type: 'TV' }}
                >
                    <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="海报图片" required rules={[{ required: true, message: '请上传海报' }]}>
                         <Upload.Dragger
                            name="file"
                            listType="picture"
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false} // Prevent automatic upload, handle manually on save
                            onRemove={() => setFileList([])}
                         >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                            <p className="ant-upload-hint">支持单张图片上传，严禁上传违禁数据或其他非法文件</p>
                        </Upload.Dragger>
                    </Form.Item>

                    <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item name="total_episodes" label="集数" rules={[{ required: true }]}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item name="rating" label="评分" rules={[{ required: true }]}>
                            <InputNumber min={0} max={10} step={0.1} />
                        </Form.Item>
                        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                            <Select options={[
                                { value: 0, label: '未开播' },
                                { value: 1, label: '连载中' },
                                { value: 2, label: '已完结' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                            <Select options={[
                                { value: 'TV', label: 'TV 剧集' },
                                { value: 'Movie', label: '剧场版' },
                            ]} />
                        </Form.Item>
                    </Space>
                    
                    <Form.Item name="tags" label="标签">
                         <Select mode="multiple" options={mockTagsList.map(t => ({ label: t.name, value: t.id }))} />
                    </Form.Item>
                    
                    <Form.Item name="studios" label="制作公司">
                         <Select mode="multiple" options={mockStudios.map(s => ({ label: s.name, value: s.id }))} />
                    </Form.Item>
                    
                    <Form.Item name="description" label="简介">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AnimeMgt;

