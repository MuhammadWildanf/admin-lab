'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import ReactTable from '@/components/Table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactTableProps } from '@/types/component-props';

interface Category {
    id: number;
    name: string;
}

interface Media {
    id: number;
    url: string;
    sort_order: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    thumbnail_url: string;
    category_id: number;
    description: string;
    category?: Category;
    media?: Media[];
}

interface FormData {
    name: string;
    category_id: string;
    description: string;
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category_id: '',
        description: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [previewThumbnail, setPreviewThumbnail] = useState<string>('');
    const [previewMedia, setPreviewMedia] = useState<string[]>([]);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:1987/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:1987/category');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

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
        setMediaFiles(prev => [...prev, ...files.filter(file => !prev.includes(file))]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewMedia(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            // Create a JSON object for the product data
            const productData = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                description: formData.description,
            };

            // Create FormData for file uploads
            const formDataToSend = new FormData();
            
            // Add product data as JSON string
            formDataToSend.append('data', JSON.stringify(productData));

            // Add thumbnail if exists
            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            // Add media files if exist
            mediaFiles.forEach((file) => {
                formDataToSend.append('media', file);
            });

            const response = await fetch('http://localhost:1987/products', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create product');
            }

            const result = await response.json();
            console.log('Create product response:', result);

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
            // Create a JSON object for the product data
            const productData = {
                name: formData.name,
                category_id: parseInt(formData.category_id),
                description: formData.description,
            };

            // Create FormData for file uploads
            const formDataToSend = new FormData();
            
            // Add product data as JSON string
            formDataToSend.append('data', JSON.stringify(productData));

            // Add thumbnail if exists
            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            // Add media files if exist
            mediaFiles.forEach((file) => {
                formDataToSend.append('media', file);
            });

            const response = await fetch(`http://localhost:1987/products/${editingProduct.id}`, {
                method: 'PUT',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }

            const result = await response.json();
            console.log('Update product response:', result);

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
            const response = await fetch(`http://localhost:1987/products/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete product');

            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
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
            accessorKey: 'thumbnail_url',
            header: 'Thumbnail',
            cell: ({ row }) => (
                <img
                    src={row.original.thumbnail_url}
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
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                            setEditingProduct(row.original);
                            setFormData({
                                name: row.original.name,
                                category_id: row.original.category_id.toString(),
                                description: row.original.description,
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

            <ReactTable {...tableProps} />

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
                                        src={previewThumbnail}
                                        alt="Thumbnail preview"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>

                        <h5 className="mt-4">Media</h5>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMediaChange}
                                ref={mediaInputRef}
                            />
                        </Form.Group>
                        {previewMedia.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {previewMedia.map((url, index) => (
                                    <div key={index} className="position-relative">
                                        <img
                                            src={url}
                                            alt={`Media ${index + 1}`}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-1"
                                            onClick={() => {
                                                setPreviewMedia(prev => prev.filter((_, i) => i !== index));
                                                setMediaFiles(prev => prev.filter((_, i) => i !== index));
                                            }}
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