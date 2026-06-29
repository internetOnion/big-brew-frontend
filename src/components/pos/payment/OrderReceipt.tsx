import type { Order, Settings } from "@/types/order";

interface OrderReceiptProps {
    order: Order;
    settings: Settings;
}

const OrderReceipt = ({ order, settings }: OrderReceiptProps) => {
    const cs = settings.currencySymbol;
    const cashPayment = order.payments.find((p) => p.method === "cash");
    const qrPayment = order.payments.find((p) => p.method === "qr");
    const payment = cashPayment ?? qrPayment;

    return (
        <div className="mx-auto w-full max-w-[300px] rounded-lg border border-border bg-white p-4 font-mono text-xs text-black shadow-sm">
            {settings.logoUrl && (
                <div className="mb-2 flex justify-center">
                    <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="h-12 w-auto object-contain"
                    />
                </div>
            )}

            <div className="mb-1 text-center text-sm font-bold">
                {settings.storeName}
            </div>

            {settings.storeAddress && (
                <div className="mb-2 text-center text-[10px] text-gray-600">
                    {settings.storeAddress}
                </div>
            )}

            {settings.receiptHeader && (
                <div className="mb-2 text-center text-[10px] text-gray-600">
                    {settings.receiptHeader}
                </div>
            )}

            <div className="my-2 border-t border-dashed border-gray-400" />

            <div className="mb-2 flex justify-between text-[10px]">
                <span>Order #{order.orderNumber}</span>
                <span>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>

            <div className="space-y-1">
                {order.items.map((item) => {
                    const lineTotal =
                        parseFloat(item.unitPrice) * item.quantity;
                    return (
                        <div key={item.id}>
                            <div className="flex justify-between">
                                <span>
                                    {item.quantity}x {item.name}
                                </span>
                                <span>
                                    {cs}
                                    {lineTotal.toFixed(2)}
                                </span>
                            </div>
                            {item.modifiers.length > 0 && (
                                <div className="pl-3 text-[9px] text-gray-500">
                                    {item.modifiers.map((m, i) => (
                                        <span key={m.id}>
                                            {i > 0 && ", "}
                                            {m.name}
                                            {parseFloat(m.price) > 0 &&
                                                ` (+${cs}${parseFloat(m.price).toFixed(2)})`}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="my-2 border-t border-dashed border-gray-400" />

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                        {cs}
                        {parseFloat(order.subtotal).toFixed(2)}
                    </span>
                </div>
                {parseFloat(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>
                            -{cs}
                            {parseFloat(order.discountAmount).toFixed(2)}
                        </span>
                    </div>
                )}
                <div className="flex justify-between border-t border-gray-400 pt-1 text-sm font-bold">
                    <span>Total</span>
                    <span>
                        {cs}
                        {parseFloat(order.total).toFixed(2)}
                    </span>
                </div>
            </div>

            {payment && (
                <>
                    <div className="my-2 border-t border-dashed border-gray-400" />
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Payment</span>
                            <span className="capitalize">
                                {payment.method === "qr" ? "QR Code" : "Cash"}
                            </span>
                        </div>
                        {payment.method === "cash" &&
                            payment.amountReceived && (
                                <div className="flex justify-between">
                                    <span>Amount Received</span>
                                    <span>
                                        {cs}
                                        {parseFloat(
                                            payment.amountReceived,
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        {payment.method === "cash" &&
                            payment.changeAmount &&
                            parseFloat(payment.changeAmount) > 0 && (
                                <div className="flex justify-between font-bold">
                                    <span>Change</span>
                                    <span>
                                        {cs}
                                        {parseFloat(
                                            payment.changeAmount,
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            )}
                    </div>
                </>
            )}

            <div className="my-2 border-t border-dashed border-gray-400" />

            {settings.receiptFooter && (
                <div className="mt-2 text-center text-[10px] text-gray-600">
                    {settings.receiptFooter}
                </div>
            )}

            <div className="mt-2 text-center text-[10px] text-gray-500">
                Thank you!
            </div>
        </div>
    );
};

export default OrderReceipt;
