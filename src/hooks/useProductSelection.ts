import { useState, useEffect, useCallback } from 'react';
import { ProductSelection, ProductPrices } from '@/types/showtime';

export function useProductSelection() {
    const [productSelection, setProductSelection] = useState<ProductSelection>({});
    const [productPrices, setProductPrices] = useState<ProductPrices>({});
    const [productNames, setProductNames] = useState<{ [key: string]: string }>({});
    const [totalProductPrice, setTotalProductPrice] = useState<number>(0);
    const [isProductStateInitialized, setIsProductStateInitialized] = useState<boolean>(false);
    const [shouldResetProducts, setShouldResetProducts] = useState<boolean>(false);

    // Effect để khởi tạo state sản phẩm từ localStorage
    useEffect(() => {
        if (!isProductStateInitialized) {
            const savedQuantities = localStorage.getItem('cartQuantities');
            if (savedQuantities) {
                try {
                    const parsed = JSON.parse(savedQuantities);
                    const hasValidQuantities = Object.values(parsed).some(qty => typeof qty === 'number' && qty > 0);
                    if (hasValidQuantities) {
                        setProductSelection(parsed);
                    }
                } catch (error) {
                    console.error('Error parsing saved quantities:', error);
                }
            }
            setIsProductStateInitialized(true);
        }
    }, [isProductStateInitialized]);

    // Effect để tính tổng giá sản phẩm
    useEffect(() => {
        const total = Object.entries(productSelection).reduce((sum, [productId, quantity]) => {
            const price = productPrices[productId] || 0;
            return sum + (price * quantity);
        }, 0);
        setTotalProductPrice(total);
    }, [productSelection, productPrices]);

    // Hàm xử lý thay đổi số lượng sản phẩm từ ProductGrid
    const handleProductQuantityChange = useCallback((productId: string, quantity: number, price: number, productName?: string) => {
        setProductSelection(prev => ({
            ...prev,
            [productId]: quantity
        }));

        setProductPrices(prev => ({
            ...prev,
            [productId]: price
        }));

        if (productName) {
            setProductNames(prev => ({
                ...prev,
                [productId]: productName
            }));
        }
    }, []);

    // Hàm reset tất cả sản phẩm
    const resetProducts = useCallback(() => {
        setProductSelection({});
        setProductPrices({});
        setProductNames({});
        setTotalProductPrice(0);
        setShouldResetProducts(true);
        localStorage.removeItem('cartQuantities');

        // Reset flag sau một chút để trigger re-render
        setTimeout(() => {
            setShouldResetProducts(false);
        }, 100);
    }, []);

    return {
        productSelection,
        productPrices,
        productNames,
        totalProductPrice,
        shouldResetProducts,
        handleProductQuantityChange,
        resetProducts
    };
}
