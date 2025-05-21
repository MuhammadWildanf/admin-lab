'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import ReactTable from '@/components/Table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactTableProps } from '@/types/component-props';
import httpClient from '@/helpers/httpClient';

const API_BASE_URL = 'http://localhost:1987/api';
const IMAGE_BASE_URL = 'http://localhost:1987';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
}

interface Media {
    id: number;
    url: string;
    sort_order: number;
}

interface Specification {
    key: string;
    value: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    thumbnail_url: string;
    category_id: number;
    description: string;
    specifications: Record<string, any>;
    requirements: Record<string, any>;
    price: string;
    is_featured: boolean;
    status: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    author_id: number;
    category?: Category;
    media?: Media[];
}

interface FormData {
    name: string;
    category_id: string;
    description: string;
    specifications: Specification[];
    requirements: Specification[];
    price: string;
    is_featured: boolean;
    status: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
}


export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category_id: '',
        description: '',
        specifications: [],
        requirements: [],
        price: '',
        is_featured: false,
        status: 'draft',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [previewThumbnail, setPreviewThumbnail] = useState<string>('');
    const [previewMedia, setPreviewMedia] = useState<string[]>([]);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Search and filter state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedFeatured, setSelectedFeatured] = useState<string>('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...(search && { search }),
                ...(selectedCategory && { category_id: selectedCategory }),
                ...(selectedStatus && { status: selectedStatus }),
                ...(selectedFeatured && { is_featured: selectedFeatured }),
            });

            const response = await httpClient.get(`${API_BASE_URL}/products?${queryParams}`);
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await httpClient.get(`${API_BASE_URL}/category`);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [search, selectedCategory, selectedStatus, selectedFeatured]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Filter out files that are already in mediaFiles
        const newFiles = files.filter(file => 
            !mediaFiles.some(existingFile => 
                existingFile.name === file.name && 
                existingFile.size === file.size
            )
        );

        setMediaFiles(prev => [...prev, ...newFiles]);

        // Create previews for new files
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewMedia(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMedia = (index: number) => {
        setPreviewMedia(prev => prev.filter((_, i) => i !== index));
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Convert specifications and requirements arrays to objects
            const specificationsObj = formData.specifications.reduce((acc, spec) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {} as Record<string, string>);

            const requirementsObj = formData.requirements.reduce((acc, req) => {
                acc[req.key] = req.value;
                return acc;
            }, {} as Record<string, string>);

            const productData = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                description: formData.description,
                specifications: specificationsObj,
                requirements: requirementsObj,
                price: formData.price,
                is_featured: formData.is_featured,
                status: formData.status,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                meta_keywords: formData.meta_keywords
            };

            const formDataToSend = new FormData();
            formDataToSend.append('data', JSON.stringify(productData));

            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            mediaFiles.forEach((file) => {
                formDataToSend.append('media', file);
            });

            const response = await httpClient.post(`${API_BASE_URL}/products`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Create product response:', response.data);

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Failed to create product:', error);
            setError(error instanceof Error ? error.message : 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setError(null);
        setLoading(true);

        try {
            // Convert specifications and requirements arrays to objects
            const specificationsObj = formData.specifications.reduce((acc, spec) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {} as Record<string, string>);

            const requirementsObj = formData.requirements.reduce((acc, req) => {
                acc[req.key] = req.value;
                return acc;
            }, {} as Record<string, string>);

            const productData = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                description: formData.description,
                specifications: specificationsObj,
                requirements: requirementsObj,
                price: formData.price,
                is_featured: formData.is_featured,
                status: formData.status,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                meta_keywords: formData.meta_keywords
            };

            const formDataToSend = new FormData();
            formDataToSend.append('data', JSON.stringify(productData));

            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            mediaFiles.forEach((file) => {
                formDataToSend.append('media', file);
            });

            const response = await httpClient.put(`${API_BASE_URL}/products/${editingProduct.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Update product response:', response.data);

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Failed to update product:', error);
            setError(error instanceof Error ? error.message : 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category_id: '',
            description: '',
            specifications: [],
            requirements: [],
            price: '',
            is_featured: false,
            status: 'draft',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
        });
        setThumbnail(null);
        setMediaFiles([]);
        setPreviewThumbnail('');
        setPreviewMedia([]);
        setEditingProduct(null);
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        if (mediaInputRef.current) mediaInputRef.current.value = '';
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await httpClient.delete(`${API_BASE_URL}/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete product');
        }
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'category.name',
            header: 'Category',
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => (
                <span>
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(parseFloat(row.original.price))}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`badge bg-${row.original.status === 'published' ? 'success' : 'warning'}`}>
                    {row.original.status}
                </span>
            ),
        },
        {
            accessorKey: 'is_featured',
            header: 'Featured',
            cell: ({ row }) => (
                <span className={`badge bg-${row.original.is_featured ? 'primary' : 'secondary'}`}>
                    {row.original.is_featured ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            accessorKey: 'thumbnail_url',
            header: 'Thumbnail',
            cell: ({ row }) => (
                <img
                    src={`${IMAGE_BASE_URL}${row.original.thumbnail_url}`}
                    alt={row.original.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                            setSelectedProduct(row.original);
                            setShowDetailModal(true);
                        }}
                    >
                        Detail
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                            setEditingProduct(row.original);
                            // Convert specifications and requirements objects to arrays
                            const specsArray = Object.entries(row.original.specifications || {}).map(([key, value]) => ({
                                key,
                                value: String(value)
                            }));
                            const reqsArray = Object.entries(row.original.requirements || {}).map(([key, value]) => ({
                                key,
                                value: String(value)
                            }));
                            setFormData({
                                name: row.original.name,
                                category_id: row.original.category_id.toString(),
                                description: row.original.description,
                                specifications: specsArray,
                                requirements: reqsArray,
                                price: row.original.price,
                                is_featured: row.original.is_featured,
                                status: row.original.status,
                                meta_title: row.original.meta_title,
                                meta_description: row.original.meta_description,
                                meta_keywords: row.original.meta_keywords,
                            });
                            setPreviewThumbnail(row.original.thumbnail_url);
                            setPreviewMedia(row.original.media?.map(m => m.url) || []);
                            setShowModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const tableProps: ReactTableProps<Product> = {
        columns,
        data: products,
        pageSize: 10,
        showPagination: true,
        rowsPerPageList: [5, 10, 25, 50],
        tableClass: 'table-hover',
        theadClass: 'table-light',
    };

    return (
        <div className="p-4">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Products</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    Add Product
                </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Featured</Form.Label>
                                <Form.Select
                                    value={selectedFeatured}
                                    onChange={(e) => setSelectedFeatured(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <ReactTable {...tableProps} />

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct && (
                        <div>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h5>Basic Information</h5>
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Name</th>
                                                <td>{selectedProduct.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Category</th>
                                                <td>{selectedProduct.category?.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Price</th>
                                                <td>
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR'
                                                    }).format(parseFloat(selectedProduct.price))}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Status</th>
                                                <td>
                                                    <span className={`badge bg-${selectedProduct.status === 'published' ? 'success' : 'warning'}`}>
                                                        {selectedProduct.status}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Featured</th>
                                                <td>
                                                    <span className={`badge bg-${selectedProduct.is_featured ? 'primary' : 'secondary'}`}>
                                                        {selectedProduct.is_featured ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <h5>SEO Information</h5>
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Meta Title</th>
                                                <td>{selectedProduct.meta_title}</td>
                                            </tr>
                                            <tr>
                                                <th>Meta Description</th>
                                                <td>{selectedProduct.meta_description}</td>
                                            </tr>
                                            <tr>
                                                <th>Meta Keywords</th>
                                                <td>{selectedProduct.meta_keywords}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h5>Description</h5>
                                    <p>{selectedProduct.description}</p>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <h5>Media</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedProduct.media?.map((media, index) => (
                                            <img
                                                key={media.id}
                                                src={`${IMAGE_BASE_URL}${media.url}`}
                                                alt={`Media ${index + 1}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <h5>Specifications</h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Key</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <h5>Requirements</h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Key</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(selectedProduct.requirements).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit/Create Modal */}
            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                resetForm();
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingProduct ? 'Edit Product' : 'Create Product'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={editingProduct ? handleUpdate : handleCreate}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        required
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={12}>
                                <h5>Specifications</h5>
                            </Col>
                            <Col md={12}>
                                <div className="mb-3">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="row mb-2">
                                            <div className="col-md-5">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Key"
                                                    value={spec.key}
                                                    onChange={(e) => {
                                                        const newSpecs = [...formData.specifications];
                                                        newSpecs[index].key = e.target.value;
                                                        setFormData({ ...formData, specifications: newSpecs });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Value"
                                                    value={spec.value}
                                                    onChange={(e) => {
                                                        const newSpecs = [...formData.specifications];
                                                        newSpecs[index].value = e.target.value;
                                                        setFormData({ ...formData, specifications: newSpecs });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newSpecs = formData.specifications.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, specifications: newSpecs });
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                specifications: [
                                                    ...formData.specifications,
                                                    { key: '', value: '' }
                                                ],
                                            });
                                        }}
                                    >
                                        Add Specification
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <h5>Requirements</h5>
                            </Col>
                            <Col md={12}>
                                <div className="mb-3">
                                    {formData.requirements.map((req, index) => (
                                        <div key={index} className="row mb-2">
                                            <div className="col-md-5">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Key"
                                                    value={req.key}
                                                    onChange={(e) => {
                                                        const newReqs = [...formData.requirements];
                                                        newReqs[index].key = e.target.value;
                                                        setFormData({ ...formData, requirements: newReqs });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Value"
                                                    value={req.value}
                                                    onChange={(e) => {
                                                        const newReqs = [...formData.requirements];
                                                        newReqs[index].value = e.target.value;
                                                        setFormData({ ...formData, requirements: newReqs });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newReqs = formData.requirements.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, requirements: newReqs });
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                requirements: [
                                                    ...formData.requirements,
                                                    { key: '', value: '' }
                                                ],
                                            });
                                        }}
                                    >
                                        Add Requirement
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <h5>SEO Information</h5>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Meta Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Meta Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Meta Keywords</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.meta_keywords}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Thumbnail</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                ref={thumbnailInputRef}
                                required={!editingProduct}
                            />
                            {previewThumbnail && (
                                <div className="mt-2">
                                    <img
                                        src={editingProduct ? `${IMAGE_BASE_URL}${previewThumbnail}` : previewThumbnail}
                                        alt="Thumbnail preview"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <h5 className="mt-4">Media</h5>
                        <Form.Group className="mb-3">
                            <Form.Label>Upload Multiple Images</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMediaChange}
                                ref={mediaInputRef}
                            />
                            <Form.Text className="text-muted">
                                You can select multiple images. Maximum file size: 5MB per image.
                            </Form.Text>
                        </Form.Group>
                        {previewMedia.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {previewMedia.map((url, index) => (
                                    <div key={index} className="position-relative">
                                        <img
                                            src={editingProduct && !url.startsWith('data:') ? `${IMAGE_BASE_URL}${url}` : url}
                                            alt={`Media ${index + 1}`}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            className="rounded"
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-1"
                                            onClick={() => removeMedia(index)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Processing...' : (editingProduct ? 'Update' : 'Create')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}