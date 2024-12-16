import { useState } from 'react';

export const useQuotationForm = (initialData) => {
    const [formData, setFormData] = useState(initialData);
    const [produk, setproduk] = useState(initialData);
    const [error, setError] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleQuotationChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProduk = [...formData.produk];

        // Update nilai input
        updatedProduk[index][name] = value;

        // Ambil biaya produk dari dataproduk
        const selectedProduk = produk.find(item => item.id === parseInt(updatedProduk[index].id_produk, 10));
        if (selectedProduk) {
            updatedProduk[index].harga_produk = selectedProduk.harga_produk || 0;
        }

        // Hitung total biaya produk
        const jumlah = parseInt(updatedProduk[index].jumlah_produk, 10) || 0;
        const biaya = updatedProduk[index].harga_produk || 0;
        updatedProduk[index].total_biaya = jumlah * biaya;

        // Perbarui formData
        setFormData({ ...formData, produk: updatedProduk });
    };


    const handleAddProduk = () => {
        setFormData({
            ...formData,
            produk: [
                ...formData.produk,
                {
                    id_produk: 0,
                    jumlah_produk: 0,
                    harga_produk: 0,
                    total_biaya: 0,
                },
            ],
        });
    };

    const handleRemoveProduk = (index) => {
        const updatedProduk = formData.produk.filter((_, i) => i !== index);
        setFormData({ ...formData, produk: updatedProduk });
    };

    return {
        formData,
        setFormData,
        setproduk,
        error,
        setError,
        handleInputChange,
        handleQuotationChange,
        handleAddProduk,
        handleRemoveProduk,
    };
};
