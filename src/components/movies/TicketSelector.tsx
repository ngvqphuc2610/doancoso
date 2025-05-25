import { useState, useEffect } from 'react';
import { CardProduct, CardTicket } from '@/components/ui/card';

interface TicketType {
    id_tickettype: number;
    type_name: string;
    description: string | null;
    price_multiplier: number;
    age_min: number | null;
    age_max: number | null;
    required_id: number;
    icon_url: string | null;
    status: string;
    fixed_price: number | null;
}

interface TicketSelection {
    [key: number]: number; // { ticketTypeId: quantity }
}

interface TicketPrices {
    [key: number]: number; // { ticketTypeId: calculatedPrice }
}

interface TicketSelectorProps {
    basePrice: number;
    onTicketSelectionChange?: (selection: TicketSelection, totalPrice: number) => void;
}

export default function TicketSelector({ basePrice, onTicketSelectionChange }: TicketSelectorProps) {
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ticketSelection, setTicketSelection] = useState<TicketSelection>({});
    const [ticketPrices, setTicketPrices] = useState<TicketPrices>({});

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const response = await fetch('/api/ticket-types');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setTicketTypes(data.data);                    // Initialize ticket selection and prices
                    const initialSelection: TicketSelection = {};
                    const initialPrices: TicketPrices = {};

                    data.data.forEach((type: TicketType) => {
                        initialSelection[type.id_tickettype] = 0;
                        // Use fixed_price directly if available, otherwise calculate with multiplier
                        initialPrices[type.id_tickettype] = type.fixed_price !== null
                            ? type.fixed_price
                            : Math.round(basePrice * type.price_multiplier);
                    });

                    setTicketSelection(initialSelection);
                    setTicketPrices(initialPrices);
                } else {
                    setError(data.error || 'Không thể tải thông tin loại vé');
                }
            } catch (error) {
                console.error('Error fetching ticket types:', error);
                setError('Đã có lỗi xảy ra khi tải dữ liệu loại vé');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTicketTypes();
    }, [basePrice]); const handleIncrease = (ticketId: number) => {
        setTicketSelection(prev => {
            const updated = { ...prev, [ticketId]: (prev[ticketId] || 0) + 1 };
            return updated;
        });
    };

    const handleDecrease = (ticketId: number) => {
        setTicketSelection(prev => {
            // Don't decrease below 0
            if (!prev[ticketId] || prev[ticketId] <= 0) return prev;

            const updated = { ...prev, [ticketId]: prev[ticketId] - 1 };
            return updated;
        });
    };

    // Use useEffect to notify parent component when selections change
    useEffect(() => {
        if (onTicketSelectionChange && Object.keys(ticketSelection).length > 0) {
            const total = calculateTotalPrice(ticketSelection);
            onTicketSelectionChange(ticketSelection, total);
        }
    }, [ticketSelection, onTicketSelectionChange]); const calculateTotalPrice = (selection: TicketSelection) => {
        return Object.entries(selection).reduce((total, [ticketId, quantity]) => {
            const numericTicketId = Number(ticketId);
            const ticketPrice = ticketPrices[numericTicketId] || 0;
            return total + ticketPrice * quantity;
        }, 0);
    };

    const totalPrice = calculateTotalPrice(ticketSelection);
    const totalTickets = Object.values(ticketSelection).reduce((sum, quantity) => sum + quantity, 0);

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-pulse">
                    <p className="text-white">Đang tải loại vé...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticketTypes.map((ticket) => (
                    <CardTicket
                        key={ticket.id_tickettype}
                        id={ticket.id_tickettype.toString()}
                        title={ticket.type_name}
                        subtitle={ticket.description || ''}
                        price={`${ticketPrices[ticket.id_tickettype].toLocaleString('vi-VN')} ₫`}
                        quantity={ticketSelection[ticket.id_tickettype] || 0}
                        onIncrease={() => handleIncrease(ticket.id_tickettype)}
                        onDecrease={() => handleDecrease(ticket.id_tickettype)}
                    />
                ))}
            </div>

            {totalTickets > 0 && (
                <div className="bg-purple-900 p-4 rounded-md mt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white">Tổng số vé: <span className="font-bold">{totalTickets}</span></p>
                        </div>
                        <div>
                            <p className="text-white text-xl font-bold">
                                Tổng tiền: {totalPrice.toLocaleString('vi-VN')} ₫
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
