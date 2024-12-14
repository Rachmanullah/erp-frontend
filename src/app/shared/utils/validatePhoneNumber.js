export const validatePhoneNumber = (value) => {
    const phoneRegex = /^(?:\+62|0)8[1-9][0-9]{7,13}$/;
    if (!phoneRegex.test(value)) {
        return 'Nomor telepon tidak valid. Harus dimulai dengan +62 atau 0 dan diikuti oleh 8 hingga 14 digit.';
    }
    return '';
};