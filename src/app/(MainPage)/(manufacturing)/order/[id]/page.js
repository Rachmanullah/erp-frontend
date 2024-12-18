"use client"
import { CircularProgress } from "@/app/shared/components"
import apiClient from "@/app/lib/apiClient";
import { use, useEffect, useState } from "react";

export default function DetailOrder({ params }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [dataOrder, setDataOrder] = useState(null);
    const [dataBom, setDataBom] = useState(null);
    const [dataBahan, setDataBahan] = useState([]);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [bahanDetails, setBahanDetails] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [isProductionDisabled, setIsProductionDisabled] = useState(false);
    const [isProductionDone, setIsProductionDone] = useState(false);

    const fetchData = async () => {
        try {
            const [responseOrder, responseBahan] = await Promise.all([
                apiClient.get(`/order/${id}`, { cache: 'force-cache' }),
                apiClient.get('/bahan', { cache: 'force-cache' }),
            ]);

            const orderData = responseOrder.data.data;
            const responseBom = await apiClient.get(`/bom/reference/${orderData.referensi_bom}`, { cache: 'force-cache' });

            setDataOrder(orderData);
            setQuantity(orderData.jumlah_order);
            setDataBahan(responseBahan.data.data);
            setDataBom(responseBom.data.data);

            const initialBahanDetails = responseBom.data.data.bahan.map((bahan) => {
                const bahanInfo = responseBahan.data.data.find((bahanItem) => bahanItem.id === bahan.id_bahan);
                // Jika status order sudah "Done", set available dan consumed sesuai toConsume
                const toConsume = orderData.jumlah_order * (bahan.jumlah_bahan || 0);
                const available = bahanInfo?.stok || 0;
                return {
                    nama_bahan: bahanInfo?.nama_bahan || 'Unknown',
                    toConsume: toConsume,  // Konsumsi bahan berdasarkan jumlah order
                    bahan_id: bahan.id_bahan,
                    available: orderData.status === 'Done' ? toConsume : available, // Menampilkan stok sesuai toConsume jika status Done
                    consumed: orderData.status === 'Done' ? toConsume : 0,
                };
            });

            setBahanDetails(initialBahanDetails);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        const validQuantity = Number.isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity;
        setQuantity(validQuantity);

        const updatedBahanDetails = bahanDetails.map((bahan) => {
            const matchingBom = dataBom.bahan.find((item) => item.id_bahan === bahan.bahan_id);
            const jumlahBahan = matchingBom ? matchingBom.jumlah_bahan : 0;
            return {
                ...bahan,
                toConsume: validQuantity * jumlahBahan, // Hitung konsumsi bahan berdasarkan jumlah order
            };
        });

        setBahanDetails(updatedBahanDetails);
    };

    const handleConfirm = async () => {
        try {
            const response = await apiClient.put(`/order/status/${id}`, { status: 'Confirmed' });
            setDataOrder(response.data.data)
            setIsConfirmed(true);
        } catch (error) {
            console.error('Error confirming order:', error);
        }
    };

    const checkAvailability = () => {
        setIsChecking(true);

        // Hitung ketersediaan stok untuk setiap bahan
        const updatedBahanDetails = bahanDetails.map((bahan) => {
            const bahanData = dataBahan.find((bahanItem) => bahanItem.id === bahan.bahan_id);
            const availableStock = bahanData?.stok || 0;
            return {
                ...bahan,
                available: Math.min(bahan.toConsume, availableStock), // Sesuaikan available dengan stok atau toConsume
            };
        });

        // Periksa apakah ada bahan yang tidak mencukupi
        const hasInsufficientStock = updatedBahanDetails.some((bahan) => bahan.available < bahan.toConsume);

        setBahanDetails(updatedBahanDetails);
        setAvailabilityChecked(true);
        setIsProductionDisabled(hasInsufficientStock); // Disable tombol jika stok tidak mencukupi
        setIsChecking(false);
    };


    const handleProduction = async () => {
        const response = await apiClient.put(`/order/status/${id}`, { status: 'Production' });
        setDataOrder(response.data.data)
        const updatedBahanDetails = bahanDetails.map((bahan) => ({
            ...bahan,
            consumed: bahan.available >= bahan.toConsume ? bahan.toConsume : 0,
        }));
        setBahanDetails(updatedBahanDetails);
        console.log("Production started with consumed materials:", updatedBahanDetails);
        setIsProductionDone(true); // Set status produksi selesai
        setIsProductionDisabled(true)
    };

    const handleMarkAsDone = async () => {
        try {
            const response = await apiClient.put(`/order/status/${id}`, { status: 'Done' });
            setDataOrder(response.data.data)
            setIsProductionDone(false);
        } catch (error) {
            console.error('Error marking as done:', error);
        }
    };

    const handleBackToDraft = async () => {
        const response = await apiClient.put(`/order/status/${id}`, { status: 'Draft' });
        setDataOrder(response.data.data)
        setIsConfirmed(false);
        setAvailabilityChecked(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        console.log('dataOrder:', dataOrder);
        console.log('dataBom:', dataBom);
        console.log('dataBahan:', dataBahan);
    }, [dataOrder, dataBom, dataBahan]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Data Order</h1>
            {isLoading ? (
                <CircularProgress size={26} />
            ) : (
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Product Name:</span>
                            <span className="text-lg font-bold text-gray-800">{dataOrder.Product?.nama_produk}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Quantity:</span>
                            {dataOrder.status === 'Done' || isConfirmed ? (
                                <span className="text-lg font-bold text-gray-800">{quantity}</span>
                            ) : (
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-lg"
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">BoM Reference:</span>
                            <span className="text-lg font-bold text-gray-800">{dataOrder?.referensi_bom}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Status:</span>
                            <span className={`max-w-max  px-5 py-2 text-lg font-bold rounded-3xl  ${dataOrder.status === 'Draft' ? 'text-black bg-yellow-300' : dataOrder.status === 'Confirmed' ? 'text-black bg-cyan-300' : dataOrder.status === 'Production' ? 'text-black bg-blue-300' : dataOrder.status === 'Done' ? 'text-white bg-green-500' : ''}`}>
                                {dataOrder?.status}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Bahan Details</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 border-collapse border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border border-gray-300">Bahan</th>
                                    <th className="px-4 py-2 border border-gray-300">To Consume</th>
                                    <th className="px-4 py-2 border border-gray-300">Available</th>
                                    <th className="px-4 py-2 border border-gray-300">Consumed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bahanDetails.map((bahan, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border border-gray-300">{bahan.nama_bahan}</td>
                                        <td className="px-4 py-2 border border-gray-300">{bahan.toConsume}</td>
                                        <td className={`px-4 py-2 border border-gray-300 ${availabilityChecked & bahan.available < bahan.toConsume ? 'bg-red-200' : ''}`}>{dataOrder.status === 'Done' ? bahan.available : !availabilityChecked ? 0 : bahan.available}</td>
                                        <td className="px-4 py-2 border border-gray-300">{bahan.consumed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex space-x-4">
                        {dataOrder.status !== 'Done' && !isConfirmed && (
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-yellow-500 text-white rounded"
                            >
                                Konfirmasi
                            </button>
                        )}
                        {
                            isConfirmed && (
                                <div>
                                    <button
                                        onClick={availabilityChecked ? handleProduction : checkAvailability}
                                        disabled={isChecking || (availabilityChecked && isProductionDisabled)}
                                        className={`px-4 py-2 rounded ${isChecking
                                            ? 'bg-gray-400'
                                            : availabilityChecked
                                                ? isProductionDisabled
                                                    ? 'bg-red-500'
                                                    : 'bg-green-500'
                                                : 'bg-blue-500'
                                            } text-white`}
                                    >
                                        {isChecking ? 'Checking...' : availabilityChecked ? 'Start Production' : 'Check Availability'}
                                    </button>
                                    {isProductionDone && (
                                        <button
                                            onClick={handleMarkAsDone}
                                            className="px-4 py-2 bg-gray-500 text-white rounded"
                                        >
                                            Mark as Done
                                        </button>
                                    )}
                                    {availabilityChecked && !isProductionDone && (
                                        <button
                                            onClick={handleBackToDraft} // Kembali ke draft
                                            className="mx-3 px-4 py-2 bg-red-500 text-white rounded"
                                        >
                                            Kembali ke Draft
                                        </button>
                                    )}
                                </div>
                            )}
                        {availabilityChecked && !bahanDetails.some(bahan => bahan.available >= bahan.toConsume) && (
                            <p className="text-red-500">Stok bahan tidak mencukupi untuk produksi!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
