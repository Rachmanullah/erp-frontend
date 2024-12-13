import { useState } from 'react';

export const useBomForm = (initialData) => {
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleBomChange = (index, event) => {
        const { name, value } = event.target;
        const updatedBahan = [...formData.bahan];
        updatedBahan[index][name] = value;

        setFormData({
            ...formData,
            bahan: updatedBahan,
        });
    };

    const handleAddBahan = () => {
        setFormData({
            ...formData,
            bahan: [
                ...formData.bahan,
                {
                    id_bahan: 0,
                    jumlah_bahan: 0,
                },
            ],
        });
    };

    const handleRemoveBahan = (index) => {
        const updatedBahan = formData.bahan.filter((_, i) => i !== index);
        setFormData({ ...formData, bahan: updatedBahan });
    };

    return {
        formData,
        setFormData,
        error,
        setError,
        handleInputChange,
        handleBomChange,
        handleAddBahan,
        handleRemoveBahan,
    };
};
