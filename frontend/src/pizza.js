import React, { useState, useEffect } from "react";
import axios from "axios";
import "./pizza.css";  // Import the CSS file

const Pizza = () => {
    const [pizzas, setPizzas] = useState([]);
    const [selectedPizza, setSelectedPizza] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState("");

    useEffect(() => {
        fetchPizzas();
    }, []);

    const fetchPizzas = async () => {
        try {
            const response = await axios.get("http://localhost:3080/api/pizzas");
            setPizzas(response.data);
        } catch (error) {
            console.error("Error fetching pizzas:", error);
        }
    };

    const handlePizzaSelection = (pizza) => {
        setSelectedPizza(pizza);
    };

    const handleQuantityChange = (event) => {
        setQuantity(parseInt(event.target.value));
    };

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const handleBuy = async () => {
        const user = localStorage.getItem("user");
        if (!user) {
            alert("User not logged in. Please log in to make a purchase.");
            return;
        }

        const parsedUser = JSON.parse(user);
        const username = parsedUser?.username;

        if (!username) {
            alert("Invalid user data. Please log in again.");
            return;
        }

        const { pizza_id, pizza_name, price } = selectedPizza;
        const totalPrice = price * quantity;
        const purchaseData = { username, pizza_id, pizza_name, quantity, address, totalPrice };

        try {
            await axios.post("http://localhost:3080/api/purchase",
                purchaseData,
                { withCredentials: true } // Ensure cookies are included
            );
            alert(`You bought ${quantity} ${selectedPizza.pizza_name} pizza(s)`);
        } catch (error) {
            console.error("Error recording purchase:", error);
            alert(`Error recording purchase: ${error.response?.data?.message || error.message}. Please try again later.`);
        }
    };



    return (
        <div className="pizza-container">
            <h2>Choose your pizza:</h2>
            <ul className="pizza-list">
                {pizzas.map((pizza) => (
                    <li key={pizza.pizza_id} className="pizza-item" onClick={() => handlePizzaSelection(pizza)}>
                        {pizza.pizza_name} - ${pizza.price}
                    </li>
                ))}
            </ul>
            {selectedPizza && (
                <div className="selected-pizza">
                    <h3>Selected Pizza: {selectedPizza.pizza_name}</h3>
                    <div className="input-field">
                        <label>
                            Quantity:
                            <input type="number" value={quantity} onChange={handleQuantityChange} />
                        </label>
                    </div>
                    <div className="input-field">
                        <label>
                            Address:
                            <input type="text" value={address} onChange={handleAddressChange} />
                        </label>
                    </div>
                    <div className="button-container">
                        <button onClick={handleBuy}>Buy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pizza;
