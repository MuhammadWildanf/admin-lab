import { Link } from 'react-router-dom'
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap'
import LogoBox from '@/components/LogoBox'

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="border-0 shadow-none">
                            <CardBody className="p-0">
                                <div className="text-center mb-4">
                                    <LogoBox
                                        textLogo={{
                                            height: 40,
                                            width: 180,
                                        }}
                                        containerClassName="mx-auto text-center"
                                    />
                                </div>

                                <div className="text-center mb-5">
                                    <h1 className="display-4 fw-bold mb-3">Welcome to IMAJIWA LAB</h1>
                                    <p className="lead text-muted mb-4">
                                        Your comprehensive dashboard solution for managing and monitoring your business
                                    </p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to="/auth/sign-in" className="btn btn-primary btn-lg">
                                            Sign In
                                        </Link>
                                        <Link to="/dashboard/analytics" className="btn btn-outline-primary btn-lg">
                                            View Dashboard
                                        </Link>
                                    </div>
                                </div>

                                <div className="row g-4 mt-5">
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="avatar-sm mx-auto mb-3">
                                                <span className="avatar-title bg-primary rounded-circle">
                                                    <i className="mdi mdi-chart-line fs-24"></i>
                                                </span>
                                            </div>
                                            <h4>Analytics</h4>
                                            <p className="text-muted">Comprehensive analytics and reporting tools</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="avatar-sm mx-auto mb-3">
                                                <span className="avatar-title bg-success rounded-circle">
                                                    <i className="mdi mdi-account-group fs-24"></i>
                                                </span>
                                            </div>
                                            <h4>User Management</h4>
                                            <p className="text-muted">Efficient user and role management system</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="avatar-sm mx-auto mb-3">
                                                <span className="avatar-title bg-info rounded-circle">
                                                    <i className="mdi mdi-cog fs-24"></i>
                                                </span>
                                            </div>
                                            <h4>Customization</h4>
                                            <p className="text-muted">Flexible and customizable dashboard interface</p>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default LandingPage 