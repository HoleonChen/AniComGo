import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import {
    VideoCameraOutlined,
    UserOutlined,
    CommentOutlined,
    EyeOutlined,
} from '@ant-design/icons';

const AdminDashboard: React.FC = () => {
    // Basic stats calculation (Placeholder)
    const totalAnimes = 0; // TODO: Fetch from API
    const ongoingAnimes = 0;
    const finishedAnimes = 0;
    
    // Mock stats for users and comments
    const totalUsers = 0;
    const totalComments = 0;

    return (
        <div>
            <h2>管理仪表盘</h2>
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="番剧总数"
                            value={totalAnimes}
                            prefix={<VideoCameraOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="活跃用户"
                            value={totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="评论总数"
                            value={totalComments}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="总浏览量"
                            value={93210}
                            prefix={<EyeOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                 <Col span={12}>
                    <Card title="番剧状态分布" bordered={false}>
                        <Row gutter={16}>
                             <Col span={12}>
                                <Statistic title="连载中" value={ongoingAnimes} />
                             </Col>
                             <Col span={12}>
                                <Statistic title="已完结" value={finishedAnimes} />
                             </Col>
                        </Row>
                    </Card>
                 </Col>
                 <Col span={12}>
                    <Card title="系统健康" bordered={false}>
                        <Statistic title="服务器运行时间" value="99.9%" valueStyle={{ color: '#3f8600' }} />
                    </Card>
                 </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;