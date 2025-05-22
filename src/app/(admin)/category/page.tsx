'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import ReactTable from '@/components/Table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactTableProps } from '@/types/component-props';
import { getApiUrl } from '@/config/api';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    products?: any[];
}

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(getApiUrl('/category'));
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            setError('Failed to load categories. Please try again.');
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch(getApiUrl('/category'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create category');
            }

            setSuccess('Category created successfully!');
            setShowModal(false);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create category');
            console.error('Failed to create category:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            setError(null);
            const response = await fetch(getApiUrl(`/category/${editingCategory.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update category');
            }

            setSuccess('Category updated successfully!');
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update category');
            console.error('Failed to update category:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            setError(null);
            const response = await fetch(getApiUrl(`/category/${id}`), {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete category');
            }

            setSuccess('Category deleted successfully!');
            fetchCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete category');
            console.error('Failed to delete category:', error);
        }
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                    {row.original.description || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'products',
            header: 'Products',
            cell: ({ row }) => (
                <span className="badge bg-secondary">
                    {row.original.products?.length || 0} products
                </span>
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
                            setEditingCategory(row.original);
                            setFormData({
                                name: row.original.name,
                                description: row.original.description || '',
                            });
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

    const tableProps: ReactTableProps<Category> = {
        columns,
        data: categories,
        pageSize: 10,
        showPagination: true,
        rowsPerPageList: [5, 10, 25, 50],
        tableClass: 'table-hover',
        theadClass: 'table-light',
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}
                >
                    Add Category
                </Button>
            </div>

            {error && (
                <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-3" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}

            {loading ? (
                <div className="text-center p-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <ReactTable {...tableProps} />
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingCategory ? 'Edit Category' : 'Create Category'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={editingCategory ? handleUpdate : handleCreate}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Enter category name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter category description (optional)"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
