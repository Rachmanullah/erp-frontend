import { useState } from "react";
import { validatePhoneNumber } from "../shared/utils/validatePhoneNumber";

export default function useForm(initialValues = {}) {
    const [formData, setFormData] = useState(initialValues);
    const [error, setError] = useState({});
    // Function to handle input changes dynamically
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'no_telp') {
            const errorMsg = validatePhoneNumber(value);
            setError((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
        }
    };

    // Function to reset form to its initial state
    const resetForm = () => {
        setFormData(initialValues);
    };

    return {
        formData,
        error,
        setError,
        handleInputChange,
        resetForm,
        setFormData, // To allow manual setting of formData if needed
    };
}
