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
}

interface SubCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    category_id: number;
    category: Category;
}

export default function SubCategoryPage() {
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', category_id: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchSubCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(getApiUrl('/sub-category'));
            if (!response.ok) throw new Error('Failed to fetch sub-categories');
            const data = await response.json();
            setSubCategories(data);
        } catch (error) {
            setError('Failed to load sub-categories. Please try again.');
            console.error('Failed to fetch sub-categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(getApiUrl('/category'));
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            setError('Failed to load categories. Please try again.');
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchSubCategories();
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch(getApiUrl('/sub-category'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category_id: Number(formData.category_id),
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create sub-category');
            }
            setSuccess('Sub-category created successfully!');
            setShowModal(false);
            setFormData({ name: '', description: '', category_id: '' });
            fetchSubCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create sub-category');
            console.error('Failed to create sub-category:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubCategory) return;
        try {
            setError(null);
            const response = await fetch(getApiUrl(`/sub-category/${editingSubCategory.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category_id: Number(formData.category_id),
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update sub-category');
            }
            setSuccess('Sub-category updated successfully!');
            setShowModal(false);
            setEditingSubCategory(null);
            setFormData({ name: '', description: '', category_id: '' });
            fetchSubCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update sub-category');
            console.error('Failed to update sub-category:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this sub-category?')) return;
        try {
            setError(null);
            const response = await fetch(getApiUrl(`/sub-category/${id}`), {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete sub-category');
            }
            setSuccess('Sub-category deleted successfully!');
            fetchSubCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete sub-category');
            console.error('Failed to delete sub-category:', error);
        }
    };

    const columns: ColumnDef<SubCategory>[] = [
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
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => row.original.category?.name || '-',
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
                            setEditingSubCategory(row.original);
                            setFormData({
                                name: row.original.name,
                                description: row.original.description || '',
                                category_id: String(row.original.category_id),
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

    const tableProps: ReactTableProps<SubCategory> = {
        columns,
        data: subCategories,
        pageSize: 10,
        showPagination: true,
        rowsPerPageList: [5, 10, 25, 50],
        tableClass: 'table-hover',
        theadClass: 'table-light',
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Sub Categories</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingSubCategory(null);
                        setFormData({ name: '', description: '', category_id: '' });
                        setShowModal(true);
                    }}
                >
                    Add Sub Category
                </Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <ReactTable {...tableProps} />
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingSubCategory ? 'Edit Sub Category' : 'Add Sub Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={editingSubCategory ? handleUpdate : handleCreate}>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="subCategoryName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="subCategoryDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="subCategoryCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingSubCategory ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
