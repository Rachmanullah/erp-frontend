export const formatTanggal = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error("Invalid Date");

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return "Tanggal tidak valid";
    }
};




export const formatWaktu = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date(dateString));
};