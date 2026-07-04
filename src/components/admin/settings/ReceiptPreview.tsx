import type { Settings } from "@/types/order";

interface ReceiptPreviewProps {
    settings: Settings;
}

const ReceiptPreview = ({ settings }: ReceiptPreviewProps) => {
    const sampleItems = [
        { name: "Latte", qty: 2, price: 4.5 },
        { name: "Mocha", qty: 1, price: 5.0 },
        { name: "Americano", qty: 1, price: 3.5 },
    ];

    const subtotal = sampleItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const taxRate = 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
        <div className="mx-auto w-full max-w-[300px] rounded-lg border border-(--admin-border) bg-(--admin-card) p-4 font-mono text-xs text-(--admin-text)">
            {/* Logo */}
            {settings.logoUrl && (
                <div className="mb-2 flex justify-center">
                    <img
                        src={settings.logoUrl}
                        alt="Logo"
                        loading="lazy"
                        className="h-12 w-auto object-contain"
                    />
                </div>
            )}

            {/* Store name */}
            <div className="mb-1 text-center text-sm font-bold">
                {settings.storeName || "Store Name"}
            </div>

            {/* Address */}
            {settings.storeAddress && (
                <div className="mb-2 text-center text-[10px] text-(--admin-text-muted)">
                    {settings.storeAddress}
                </div>
            )}

            {/* Header */}
            {settings.receiptHeader && (
                <div className="mb-2 text-center text-[10px] text-(--admin-text-muted)">
                    {settings.receiptHeader}
                </div>
            )}

            <div className="my-2 border-t border-dashed border-(--admin-text-muted)/40" />

            {/* Order info */}
            <div className="mb-2 flex justify-between text-[10px]">
                <span>Order #42</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1">
                {sampleItems.map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between">
                            <span>
                                {item.qty}x {item.name}
                            </span>
                            <span>
                                {settings.currencySymbol}
                                {(item.price * item.qty).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-2 border-t border-dashed border-(--admin-text-muted)/40" />

            {/* Totals */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                        {settings.currencySymbol}
                        {subtotal.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>{settings.taxLabel || "Tax"} (7%)</span>
                    <span>
                        {settings.currencySymbol}
                        {tax.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between border-t border-(--admin-text-muted)/40 pt-1 text-sm font-bold">
                    <span>Total</span>
                    <span>
                        {settings.currencySymbol}
                        {total.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="my-2 border-t border-dashed border-(--admin-text-muted)/40" />

            {/* Footer */}
            {settings.receiptFooter && (
                <div className="mt-2 text-center text-[10px] text-(--admin-text-muted)">
                    {settings.receiptFooter}
                </div>
            )}

            <div className="mt-2 text-center text-[10px] text-(--admin-text-secondary)">
                Thank you!
            </div>
        </div>
    );
};

export default ReceiptPreview;
