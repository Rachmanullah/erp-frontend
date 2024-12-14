import { useState } from 'react';

export const useRfqForm = (initialData) => {
    const [formData, setFormData] = useState(initialData);
    const [bahan, setbahan] = useState(initialData);
    const [error, setError] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRfqChange = (index, e) => {
        const { name, value } = e.target;
        const updatedBahan = [...formData.bahan];

        // Update nilai input
        updatedBahan[index][name] = value;

        // Ambil biaya bahan dari dataBahan
        const selectedBahan = bahan.find(item => item.id === parseInt(updatedBahan[index].id_bahan, 10));
        if (selectedBahan) {
            updatedBahan[index].biaya_bahan = selectedBahan.biaya_bahan || 0;
        }

        // Hitung total biaya bahan
        const jumlah = parseInt(updatedBahan[index].jumlah_bahan, 10) || 0;
        const biaya = updatedBahan[index].biaya_bahan || 0;
        updatedBahan[index].total_biaya = jumlah * biaya;

        // Perbarui formData
        setFormData({ ...formData, bahan: updatedBahan });
    };


    const handleAddBahan = () => {
        setFormData({
            ...formData,
            bahan: [
                ...formData.bahan,
                {
                    id_bahan: 0,
                    jumlah_bahan: 0,
                    biaya_bahan: 0,
                    total_biaya: 0,
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
        setbahan,
        error,
        setError,
        handleInputChange,
        handleRfqChange,
        handleAddBahan,
        handleRemoveBahan,
    };
};
