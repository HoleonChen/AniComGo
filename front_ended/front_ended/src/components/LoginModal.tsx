import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { mockCurrentUser } from '../data/mockData';

const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    // Reset form when modal opens or tab changes
    useEffect(() => {
        if (isLoginModalOpen) {
            form.resetFields();
        }
    }, [isLoginModalOpen, activeTab, form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            // Simulation of API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (activeTab === 'login') {
                // Mock login logic
                 login('mock-jwt-token-123456', { ...mockCurrentUser, username: values.username });
                 message.success('登录成功！');
                 closeLoginModal();
            } else {
                // Mock registration logic
                message.success('注册成功！请登录');
                setActiveTab('login');
                form.resetFields();
            }
        } catch (error) {
            console.error('Operation failed:', error);
            message.error('操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            footer={null}
            open={isLoginModalOpen}
            onCancel={closeLoginModal}
            width={400}
            destroyOnClose
            centered
        >
             <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: token.colorPrimary }}>AniComGo</h2>
                <p style={{ color: token.colorTextSecondary }}>{activeTab === 'login' ? '欢迎回来' : '创建新账号'}</p>
            </div>
            
            <Form
                form={form}
                name="auth_form"
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
                initialValues={{ remember: true }}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                {activeTab === 'register' && (
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
                    </Form.Item>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        {activeTab === 'login' ? '登录' : '注册'}
                    </Button>
                </Form.Item>
                
                 <div style={{ textAlign: 'center' }}>
                     {activeTab === 'login' ? (
                        <>还没有账号？ <a onClick={() => setActiveTab('register')}>立即注册</a></>
                     ) : (
                        <>已有账号？ <a onClick={() => setActiveTab('login')}>去登录</a></>
                     )}
                </div>
            </Form>
        </Modal>
    );
};

export default LoginModal;

