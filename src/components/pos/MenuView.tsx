import MenuGrid from "./MenuGrid";
import Cart from "./Cart";

const MenuView = () => {
    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden">
                <MenuGrid />
            </div>
            <Cart />
        </div>
    );
};

export default MenuView;
